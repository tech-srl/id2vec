import {Property} from './Property'
import {hashCode} from '../Common/utilities'


export class ProgramRelation {
	protected m_Source:Property ;
	private m_Target:Property;
	private m_HashedPath:string;
	private m_Path:string;	
    public static s_Hasher  = (str:string) => hashCode(str).toString();

    constructor(sourceName: Property, targetName:Property, path:string){
        this.m_Source = sourceName;
        this.m_Target = targetName;
        this.m_Path = path;
        this.m_HashedPath = ProgramRelation.s_Hasher(this.m_Path);
    }

	public static setNoHash():void {
		ProgramRelation.s_Hasher = (str: string) => str;
	}

	public toString(): string{
        return this.m_Source.getName() + ',' + this.m_HashedPath + ',' + this.m_Target.getName();
	}

	public getPath():string {
		return this.m_Path;
	}

	public getSource():Property {
		return this.m_Source;
    }
    
	public getTarget():Property  {
		return this.m_Target;
	}

	public getHashedPath():string{
		return this.m_HashedPath;

	}
}
