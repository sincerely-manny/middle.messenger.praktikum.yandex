/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
export const importTemplatesWP: Record<string, any> = {
    tmpl: (templateName: string) => {
        const template = require(`../templates/${templateName}.tbt`);
        return template.default;
    },
};

export default { importTemplatesWP };
