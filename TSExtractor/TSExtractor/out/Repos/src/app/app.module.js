"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var ionic_angular_1 = require("ionic-angular");
var status_bar_1 = require("@ionic-native/status-bar");
var push_1 = require("@ionic-native/push");
var splash_screen_1 = require("@ionic-native/splash-screen");
var tabs_1 = require("../pages/tabs/tabs");
var app_1 = require("./app");
var home_1 = require("../pages/home/home");
var details_1 = require("../pages/details/details");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_1.IonicPushApp,
                tabs_1.TabsPage,
                home_1.HomePage,
                details_1.DetailsPage
            ],
            imports: [
                platform_browser_1.BrowserModule,
                ionic_angular_1.IonicModule.forRoot(app_1.IonicPushApp)
            ],
            bootstrap: [ionic_angular_1.IonicApp],
            entryComponents: [
                app_1.IonicPushApp,
                tabs_1.TabsPage,
                home_1.HomePage,
                details_1.DetailsPage
            ],
            providers: [
                { provide: core_1.ErrorHandler, useClass: ionic_angular_1.IonicErrorHandler },
                status_bar_1.StatusBar,
                splash_screen_1.SplashScreen,
                push_1.Push
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map