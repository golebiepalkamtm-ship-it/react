export const generateComponentDocs = (component: React.FC) => {
  const { props, description } = component.__docgenInfo;
  
  return `## ${component.name}
${description}

### Props
${Object.entries(props)
  .map(([name, prop]) => `- **${name}**: ${prop.description}`)
  .join('\n')}
`;
};