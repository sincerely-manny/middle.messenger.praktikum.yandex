/**
 * @File   : script.js
 * @Author :  ()
 * @Link   : 
 * @Date   : 4/16/2022, 3:46:08 PM
 */

import { TemplateBike } from "./modules/templatebike";
import { renderMessages } from './utils/renderMessages';
import { dumbRouter } from './utils/dumbRouter';
import { data } from './utils/testData';

const TE = new TemplateBike(data);
dumbRouter(TE);
window.addEventListener('hashchange', function() {dumbRouter(TE)});
