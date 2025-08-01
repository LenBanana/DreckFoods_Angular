import {bootstrapApplication} from '@angular/platform-browser';
import {importProvidersFrom, isDevMode} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {provideServiceWorker} from '@angular/service-worker';
import '@angular/localize/init';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(BrowserAnimationsModule),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }), provideCharts(withDefaultRegisterables()),
  ],
}).catch((err) => console.error(err));
