/* eslint-disable func-names */
/* eslint-disable global-require */
// велосипед для импорта шаблонов в тестах

import * as fs from 'fs';

export const importTemplatesFS: any = {
    tmpl: new Proxy({}, {
        get(_target, prop) {
            return importTemplatesFS.tmplFn(prop);
        },
    }),
    tmplFn: async (templateName: string, path = '') => {
        let buffer: any;
        try {
            buffer = fs.readFileSync(`./src/templates/${path}${templateName}.tbt`);
        } catch {
            buffer = fs.lstatSync(`./src/templates/${path}${templateName}`);
        }
        if (buffer?.isDirectory && buffer.isDirectory()) {
            return new Proxy({}, {
                get(_target, prop) {
                    return importTemplatesFS.tmplFn(prop, `${templateName}/`);
                },
            });
        }
        const fileContent = buffer.toString();
        return async function () { return { default: fileContent }; };
    },
};

export default { importTemplatesFS };
