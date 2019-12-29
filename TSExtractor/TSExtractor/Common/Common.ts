
export class Common{

    public static EmptyString: string="";
    public static UTF8:string = "utf-8";
    public static internalSeparator:string = "|";
    public static EvaluateTempDir:string = "EvalTemp";
    public static FieldAccessExpr:string = "FieldAccessExpr";
    public static ClassOrInterfaceType:string = "ClassOrInterfaceType";
    public static MethodDeclaration:string = "MethodDeclaration";
    public static NameExpr:string = "NameExpr";
    public static MethodCallExpr:string = "MethodCallExpr";
    public static DummyNode:string = "DummyNode";
    public static BlankWord:string = "BLANK"
    public static c_MaxLabelLength:number = 50;
	public static methodName:string = "METHOD_NAME";

    public static normalizeName(original: string ,defaultString: string): string  {
		let carefulStripped = original.toLowerCase()
				.replace(/\s/g, "") // whitespaces
				.replace(/[\"',]/g, "") // quotes, apostrophies, commas
				.replace(/\\P{Print}/g, ""); // unicode weird characters
		let stripped: string = original.replace(/[^A-Za-z]/g, "");
		if (stripped.length == 0) {
			if (carefulStripped.length == 0) {
				return defaultString;
			} else {
				return carefulStripped;
			}
		} else {
			return stripped;
		}
	}

	public static splitToSubtokens(str1: string): Array<string> {
        let str2: string = str1.trim();
        let strArray = str2.split("(?<=[a-z])(?=[A-Z])|_|[0-9]|(?<=[A-Z])(?=[A-Z][a-z])|\\s+");
        return strArray.filter(s => s.length > 0).map(s => Common.normalizeName(s, ""))
                .filter(s => s.length > 0);
	}
}    
