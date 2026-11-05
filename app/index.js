// @generated
/**
 * @hanzo/design/app: Hanzo Design as a standalone application component.
 *
 * Separated from @hanzo/studio (which houses DirectorStudio film/video, 3D mesh
 * workflows, and FlowStudio node graphs).
 *
 * `Design({host, rail})` under a gui root in a box with a height; `nav(host,
 * go)` for a host that draws Design's places in a rail of its own (the Hanzo
 * app at hanzo.ai/design).
 */
export { Design, Design as Studio } from './design.js';
export { nav, NEW } from './nav.js';
export { path, route } from './route.js';
export { CATEGORIES, RUNTIME, STARTERS } from './starters.js';
