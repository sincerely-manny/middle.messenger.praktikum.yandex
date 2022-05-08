import { TemplateBike } from "./modules/templatebike";
import { dumbRouter } from './utils/dumbRouter';
import { data } from './utils/testData';

const TE = new TemplateBike(data);
dumbRouter(TE);
window.addEventListener('hashchange', function() {dumbRouter(TE)});
