export class BetterAngelsDebugger {

    static renderTestHTML({
        top = 300,
        left = 300,
        height = 100,
        width = 300
    } = {}) {
        const testApp = new Application({
            popOut: true,
            template: "systems/betterangels/templates/debug/renderObjectTest.html",
            classes: ["test-object"]
        });
        testApp.render(true, {top, left, height, width});
        return testApp;
    }

}