import { CommandLineValues } from './Common/CommandLineValues';
import { ProgramFeatures } from './FeaturesEntities/ProgramFeatures';
import { Common } from './Common/Common';
import { Node, SyntaxKind, getDefaultCompilerOptions, createProgram, TypeFlags, Program, TypeChecker, Type } from 'typescript';
import { ts, SourceFile, Project } from 'ts-morph'

export class FeatureExtractor {
	private m_CommandLineValues: CommandLineValues;
	private filePath: string;
	private project: Project;
	private sourceFile: SourceFile;
	private root: Node;
	private program: Program;
	public checker: TypeChecker;
	private functionAndMethodEntries: Array<ts.Symbol>;
	private functions: Array<Node>;
	private static s_ParentTypeToAddChildId: Set<String>= new Set<String>();
	private static lparen: string = "(";
	private static rparen: string = ")";
	private static upSymbol: string = "^";
	private static downSymbol: string = "_";

	public static init(){
		FeatureExtractor.s_ParentTypeToAddChildId.add("AssignExpr");
		FeatureExtractor.s_ParentTypeToAddChildId.add("ArrayAccessExpr");
		FeatureExtractor.s_ParentTypeToAddChildId.add("FieldAccessExpr");
		FeatureExtractor.s_ParentTypeToAddChildId.add("MethodCallExpr");
	}

    constructor(commandLineValues: CommandLineValues, filePath: string) {
		this.m_CommandLineValues = commandLineValues;
		this.filePath = filePath;
		this.program = createProgram([this.filePath], getDefaultCompilerOptions());
		this.checker = this.program.getTypeChecker();
		
		this.project = new Project();
		this.sourceFile = this.project.addExistingSourceFile(filePath);
		this.sourceFile.getSymbol();
		this.findFunctionAndMethodEntries(this.sourceFile);
		this.root = this.sourceFile.compilerNode;
		this.functions = new Array<Node>();
		this.findFunctions(this.root);
	}

	/**
	 * Extracts program features. Each feature contains all the contexts of a specific identifier in the AST.
	 */
	public extractFeatures(): Array<ProgramFeatures> {
		var programFeatures: Array<ProgramFeatures> = new Array<ProgramFeatures>();
		for (let func of this.functions) {
			let identifiersSymbols: Array<ts.Symbol> = this.getFuncIdsSymbols(func);
			if (identifiersSymbols.length == 0) continue;
			let idsLeavesLists: Array<Array<Node>> = this.createLeavesListForEachIdentifier(func);
			if (idsLeavesLists.length == 0) continue;
			let funcLeaves: Array<Node> = this.getFunctionLeaves(func);
			let funcProgramFeatures: Array<ProgramFeatures> = this.generatePathFeaturesForFunction(idsLeavesLists, funcLeaves, identifiersSymbols);
			programFeatures = programFeatures.concat(funcProgramFeatures);
		}
		return programFeatures;
	}

	/**
	 * Gets the symbols of the identifiers in function /func.
	 * @param func - the function whose identifiers' symbols should be returned.
	 */
	private getFuncIdsSymbols(func: Node) : Array<ts.Symbol> {
		let identifiersSymbols: Array<ts.Symbol> = new Array<ts.Symbol>();
		let funcName: string;
		func.forEachChild(node => {
			if (node.kind == SyntaxKind.Identifier) funcName = node.getText();
		});
		let funcEntry = this.functionAndMethodEntries.filter(entry => entry.getName() == funcName)[0];
		if (funcEntry == null) return identifiersSymbols;
		let variableEntries = funcEntry.valueDeclaration['locals'];	
		variableEntries.forEach((id:ts.Symbol) => {
			identifiersSymbols.push(id);
		});
		return identifiersSymbols;
	}

	/**
	 * Creates for each identifier in the program an array of all its leaves. Then it returns
	 * all these arrays (in an array).
	 */
	private createLeavesListForEachIdentifier(func: Node): Array<Array<Node>> {
		var lists: Array<Array<Node>> = new Array<Array<Node>>();
		let idLeaves: Array<Node> = this.getFunctionIdLeaves(func);
		if (idLeaves.length == 0) return null;

		idLeaves.sort((n1,n2) => {
			let s1 = n1.getText(), s2 = n2.getText();
			if (s1 > s2) return 1;
			else if (s1 < s2) return -1;
			return 0;
		});

		lists.push(new Array<Node>());
		var prev_id: Node = idLeaves[0];
		for (let i: number = 0, j: number = 0; i < idLeaves.length; i++) {
			if (idLeaves[i].getText() == prev_id.getText()) {
				lists[j].push(idLeaves[i]);
			} else {
				lists.push(new Array<Node>());
				lists[++j].push(idLeaves[i]);
				prev_id = idLeaves[i];
			}
		}
		return lists;
	}

	/**
	 * Gets the leaves of the identifiers in function /func.
	 * @param func - the function.
	 */
	private getFunctionIdLeaves(func: Node): Array<Node> {
		let functionIdLeaves: Array<Node> = new Array<Node>();
		function findFunctionIdLeaves(node: Node) {
			if (node.kind === SyntaxKind.Identifier) {
				functionIdLeaves.push(node);
			}
			node.forEachChild(findFunctionIdLeaves);
		}
		findFunctionIdLeaves(func);
		return functionIdLeaves;
	}

	/**
	 * Gets the leaves of function /func.
	 * @param func - the function.
	 */
	private getFunctionLeaves(func: Node): Array<Node> {
		let functionLeaves: Array<Node> = new Array<Node>();
		function findFunctionIdLeaves(node: Node) {
			if (node.getChildCount() == 0) {
				functionLeaves.push(node);
			}
			node.forEachChild(findFunctionIdLeaves);
		}
		findFunctionIdLeaves(func);
		return functionLeaves;
	}

	/**
	 * Generates features (contexts; paths) for each identifier in the AST.
	 * @param idLeavesLists - an array of arrays. Each array in idLeavesLists contains all the
	 * leaves of a specific identifier.
	 */
	private generatePathFeaturesForFunction(idLeavesLists: Array<Array<Node>>, functionLeaves: Array<Node>, identifiersSymbols: Array<ts.Symbol>): Array<ProgramFeatures> {
		let identifiersFeatures: Array<ProgramFeatures> = new Array<ProgramFeatures>();
		for (let idLeaves of idLeavesLists) {
			let singleIdFeatures: ProgramFeatures = this.generatePathFeaturesForIdentifier(idLeaves, functionLeaves, identifiersSymbols);
			if (!singleIdFeatures.isEmpty()) {
				identifiersFeatures.push(singleIdFeatures);
			}
		}
		return identifiersFeatures;
	}

	/**
	 * Generates features (contexts; paths) for an identifier in the AST.
	 * @param idLeaves - the identifier's leaves in the AST.
	 */
	private generatePathFeaturesForIdentifier(idLeaves: Array<Node>, functionLeaves: Array<Node>, identifiersSymbols: Array<ts.Symbol>): ProgramFeatures {
		let programFeatures: ProgramFeatures = new ProgramFeatures(this.m_CommandLineValues, idLeaves.length);
		var identifier: Node = idLeaves[0];
		programFeatures.setVariableName(identifier.getText());

		// Find and set the identifier's type:
		let idSymbol: ts.Symbol = identifiersSymbols.filter(id => id.getName()===identifier.getText())[0];
		if (idSymbol == null) return programFeatures;
		let currType: Type = this.checker.getTypeOfSymbolAtLocation(idSymbol, identifier);
		if (currType.flags === TypeFlags.Object) {
			programFeatures.setVariableType(currType.symbol.name);
		}
		else if (TypeFlags[currType.flags]) {
			programFeatures.setVariableType(TypeFlags[currType.flags].toLowerCase());
		}
		else {
			return programFeatures;
		}

		// The following loop will create paths between the identifier's leaves themselves:
		for (let i: number = 0; i < idLeaves.length; i++) {
			for (let j: number = i+1; j < idLeaves.length; j++) {
				let source: Node = idLeaves[i];
				let target: Node = idLeaves[j];
				let path: string = this.generatePath(source, target);
				if (path != Common.EmptyString) {
					programFeatures.addFeature(source, path, target);
				}
			}
		}

		/* The following loop will create paths between the identifier's leaves and
		all other leaves: */
		for (let i: number = 0; i < idLeaves.length; i++) {
			for (let j: number = 0; j < functionLeaves.length; j++) {
				let source: Node = idLeaves[i];
				let target: Node = functionLeaves[j];
				// This if statement makes sure we don't create a path between the identifier's leaves again:
				if (source.getText() == target.getText()) continue;
				let path: string = this.generatePath(source, target);
				if (path != Common.EmptyString) {
					programFeatures.addFeature(source, path, target);
				}
			}
		}

		return programFeatures;
	}

	/**
	 * Finds the nodes of functions and methods in the AST whose root is /node.
	 * @param node 
	 */
	private findFunctions(root: Node): void {
		let functions: Array<Node> = new Array<Node>();
		function findFunctionNodes(node: Node) {
			if (node.kind == SyntaxKind.FunctionDeclaration || node.kind == SyntaxKind.MethodDeclaration) {
				functions.push(node);
			}
			node.forEachChild(findFunctionNodes);
		}
		findFunctionNodes(root);
		this.functions = functions;
	}
	
	/**
	 * Finds the symbols of the identifiers defined in functions and methods.
	 * @param sourceFile - the source file.
	 */
	private findFunctionAndMethodEntries(sourceFile: SourceFile): void {
		// Get the identifiers table
		const localEntries = (sourceFile.compilerNode as any)['locals'] as ts.SymbolTable | undefined;
		
		var functionAndMethodEntries = new Array<ts.Symbol>();

		// The following forEach loop gets all the functions' entries and methods' entries:
		localEntries.forEach((entry) => {
			if(entry.valueDeclaration && entry.valueDeclaration.kind == SyntaxKind.FunctionDeclaration) {
				// entry is a function
				functionAndMethodEntries.push(entry);
			} else if (entry.declarations  && entry.declarations[0].kind == SyntaxKind.ClassDeclaration) {
				const members = this.checker.getExportSymbolOfSymbol(entry).members;
				// entry is a class; The following forEach loop gets all the methods' entries of this class
				members.forEach((entry:ts.Symbol) => {
					if (entry.valueDeclaration && entry.valueDeclaration.kind == SyntaxKind.MethodDeclaration) {
						// entry is a method
						functionAndMethodEntries.push(entry);
					}
				});
			} else return;
		});

		this.functionAndMethodEntries = functionAndMethodEntries;
	}

	/**
	 * Generates a string which represents a path between two leaves in the AST.
	 * @param source - a source node (leaf).
	 * @param target - a target node (leaf).
	 */
	private generatePath(source: Node , target: Node): string {
		let down: string = FeatureExtractor.downSymbol;
		let up: string = FeatureExtractor.upSymbol;
		let startSymbol: string = FeatureExtractor.lparen;
		let endSymbol: string = FeatureExtractor.rparen;

		let stringBuilder: string = Common.EmptyString;
		let sourceStack: Array<Node> = FeatureExtractor.getTreeStack(source);
		let targetStack: Array<Node> = FeatureExtractor.getTreeStack(target);
		
		let commonPrefix: number = 0;
		let currentSourceAncestorIndex: number = sourceStack.length - 1;
		let currentTargetAncestorIndex: number = targetStack.length - 1;
		while (currentSourceAncestorIndex >= 0 && currentTargetAncestorIndex >= 0
				&& sourceStack[currentSourceAncestorIndex] == targetStack[currentTargetAncestorIndex]) {
			commonPrefix++;
			currentSourceAncestorIndex--;
			currentTargetAncestorIndex--;
		}

		let pathLength: number = sourceStack.length + targetStack.length - 2 * commonPrefix;
		if (pathLength > this.m_CommandLineValues.MaxPathLength) {
			return Common.EmptyString;
		}

		/* Don't create a path between leaves that belong to different functions, classes and interfaces.
		This loop also makes sure that the path is created only between two leaves of the same line of code, or the same
		block (for example an if statement or a loop). This happens because we stop when we see that a FunctionDeclaration
		is in the path (the same happens with ClassDeclaration and InterfaceDeclaration). */
		for (let i = 0; i <= sourceStack.length - commonPrefix; i++) {
			var currentNode: Node = sourceStack[i];
			var kind: SyntaxKind = currentNode.kind;
			var pathUpperBoundTypes: Array<SyntaxKind> = [SyntaxKind.SourceFile,SyntaxKind.FunctionDeclaration, SyntaxKind.MethodDeclaration, SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration];
			if (pathUpperBoundTypes.some(x => x === kind)) {
				return Common.EmptyString;
			}
		}
		
		// Build the string up the path
		for (let i = 0; i < sourceStack.length - commonPrefix; i++) {
			var currentNode: Node = sourceStack[i];
			stringBuilder = stringBuilder + startSymbol +
					SyntaxKind[currentNode.kind] + endSymbol + up;
		}

		// Add the common ancestor
		var commonNode: Node = sourceStack[sourceStack.length - commonPrefix];
		stringBuilder = stringBuilder + startSymbol +
					SyntaxKind[commonNode.kind] + endSymbol;

		// Continue building the string down the path
		for (let i = targetStack.length - commonPrefix - 1; i >= 0; i--) {
			var currentNode: Node = targetStack[i];
			stringBuilder = stringBuilder + down + startSymbol +
					SyntaxKind[currentNode.kind] + endSymbol;
		}
		return stringBuilder;
	}

	/**
	 * Gets the actual path in the AST between the given node and the root.
	 * @param node - The returned path contains all the nodes between the node and the root
	 */
	private static getTreeStack(node: Node): Array<Node> {
		let upStack: Array<Node> = new Array<Node>();
		let currentNode: Node = node;
		while (currentNode != null) {
			upStack.push(currentNode);
			currentNode = currentNode.parent;
		}
		return upStack;
	}
}
