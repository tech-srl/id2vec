function factorial(n: number) {
	if (n < 1) {
		return 1;
	}
	return n*factorial(n-1);
}