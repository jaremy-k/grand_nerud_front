export function numberInputFormatter(
  val: string,
  options: {
    integerOnly?: boolean;
    allowStartPad?: boolean;
  } = {
    integerOnly: false,
    allowStartPad: false,
  }
) {
  let formatted = options.integerOnly
    ? val.replace(/[^0-9]/g, "")
    : val
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*)\./g, "$1")
        .replace(/(\.\d{2})\d+$/, "$1");

  if (
    !options.allowStartPad &&
    formatted.startsWith("0") &&
    formatted.length > 1 &&
    formatted[1] !== "."
  ) {
    formatted = formatted.replace(/^0+/, "");
  }

  return formatted;
}
