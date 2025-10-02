export const tw = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const classString = String.raw({ raw: strings }, ...values);
  return classString
    .split(' ')
    .filter(Boolean)
    .map((className) => {
      if (className.startsWith('report-')) {
        return className;
      }
      return `report-${className}`;
    })
    .join(' ');
};
