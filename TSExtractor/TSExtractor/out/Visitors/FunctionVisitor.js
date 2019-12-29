// import {MethodContent} from '../Common/MethodContent'
// import {leavesCollectorVisitor} from './LeavesCollectorVisitor'
// import {MethodDeclaration} from 'typescript'
// import { Common } from "../Common/Common";
// // @SuppressWarnings("StringEquality")
// public class FunctionVisitor /*extends VoidVisitorAdapter<Object>*/ {
// 	private m_Methods: Array<MethodContent>  = new Array<>();
// 	public visit( node: MethodDeclaration, arg:Object ): void {
// 		visitMethod(node, arg);
// 		super.visit(node, arg);
// 	}
// 	private visitMethod(node:MethodDeclaration, obj:Object):void {
// 		let leavesCollectorVisitor: LeavesCollectorVisitor = new LeavesCollectorVisitor();
// 		leavesCollectorVisitor.visitDepthFirst(node);
// 		ArrayList<Node> leaves = leavesCollectorVisitor.getLeaves();
// 		String normalizedMethodName = Common.normalizeName(node.getName(), Common.BlankWord);
// 		ArrayList<String> splitNameParts = Common.splitToSubtokens(node.getName());
// 		String splitName = normalizedMethodName;
// 		if (splitNameParts.size() > 0) {
// 			splitName = splitNameParts.stream().collect(Collectors.joining(Common.internalSeparator));
// 		}
// 		if (node.getBody() != null) {
// 			m_Methods.add(new MethodContent(leaves, splitName, getMethodLength(node.getBody().toString())));
// 		}
// 	}
// 	private  getMethodLength(code: string): number {
// 		let cleanCode: string = code.replace("\r\n", "\n").replace("\t", " ");
// 		if (cleanCode.startsWith("{\n"))
// 			cleanCode = cleanCode.substring(3).trim();
// 		if (cleanCode.endsWith("\n}"))
// 			cleanCode = cleanCode.substring(0, cleanCode.length - 2).trim();
// 		if (cleanCode.length == 0) {
// 			return 0;
// 		}
// 		let codeLength: number = cleanCode.split("\n")
// 				.filter(line => (line.trim() != "{" && line.trim() != "}" && line.trim() != ""))
//                 .filter(line => !line.trim().startsWith("/") && !line.trim().startsWith("*")).length;
//         return codeLength;
// 	}
// // }
//# sourceMappingURL=FunctionVisitor.js.map