import { CommandLineValues } from '../Common/CommandLineValues';
import { ProgramRelation } from './ProgramRelations'
import { Property } from './Property';
import { Node } from 'typescript'

export class ProgramFeatures {
	private m_CommandLineValues: CommandLineValues;
	private variableType: string;
	private variableName: string;
	private features: Array<ProgramRelation>  = new Array<ProgramRelation>();
	private numOfInstances: number;

	constructor(commandLineValues: CommandLineValues, numOfInstances: number) {
		this.m_CommandLineValues = commandLineValues;
		this.numOfInstances = numOfInstances;
    }
	
	public toString(): string {
		let debugMode: boolean = this.m_CommandLineValues.debugMode;
		let testSetMode: boolean = this.m_CommandLineValues.testSetMode;
		var res: string;
		if (debugMode) {
			res = this.getVariableName();
			res += "|" + this.getVariableType();
		} else {
			res = this.getVariableType();
		}
		if (testSetMode) {
			res += " " + this.numOfInstances;
		}
		for (let feature of this.getFeatures()){
			res += " " + feature.toString();			
		}
		return res;
	}

	public addFeature(source:Node, path:string, target:Node): void {
		let sourceProperty: Property = new Property(source);
		let targetProperty: Property = new Property(target);
		var newRelation: ProgramRelation = new ProgramRelation(sourceProperty, targetProperty, path);
		this.features.push(newRelation);
	}

	public getNumFeatures(): number {
		return this.features.length;
	}

	public isEmpty():boolean {
		return this.features.length==0;
	}

	public setVariableType(varType: string): void {
		this.variableType = varType;
	}
	
	public getVariableType(): string {
		return this.variableType;
	}

	public setVariableName(varName: string): void {
		this.variableName = varName;
	}

	public getVariableName(): string {
		return this.variableName;
	}

	public getFeatures():Array<ProgramRelation>  {
		return this.features;
	}

}
