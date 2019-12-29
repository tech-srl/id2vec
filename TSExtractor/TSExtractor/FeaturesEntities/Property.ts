import {Common} from '../Common/Common'
import {SyntaxKind, Node} from 'typescript';

export class Property {
	private RawType: string;
	private Type: string;
	private Name: string;
	private SplitName: string;

	constructor(node: Node) {
		this.RawType = this.Type = SyntaxKind[node.kind];
		let nameToSplit: string = node.getFullText();
		let splitNameParts: Array<String> = Common.splitToSubtokens(nameToSplit);
		this.SplitName = splitNameParts.join(Common.internalSeparator);
		this.Name = Common.normalizeName(node.getText(), Common.BlankWord);
		if (this.Name.length > Common.c_MaxLabelLength) {
			this.Name = this.Name.substring(0, Common.c_MaxLabelLength);
		}
		if (this.SplitName.length == 0) {
			this.SplitName = this.Name;
		}
	}

	public getRawType():string {
		return this.RawType;
	}

	public getType():string{
		return this.Type;
	}

	public getName():string{
		return this.Name;
	}
}
