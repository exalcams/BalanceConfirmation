import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule, MatSpinner, MatProgressSpinner, MatProgressSpinnerModule, MatTooltip, MatTooltipModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FileUploadModule } from 'ng2-file-upload';
import { MenuAppComponent } from './menu-app/menu-app.component';
import { RoleComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { UserSideBarComponent } from './user/user-side-bar/user-side-bar.component';
import { UserMainContentComponent } from './user/user-main-content/user-main-content.component';
import { RoleSideBarComponent } from './role/role-side-bar/role-side-bar.component';
import { RoleMainContentComponent } from './role/role-main-content/role-main-content.component';
import { MenuAppSideBarComponent } from './menu-app/menu-app-side-bar/menu-app-side-bar.component';
import { MenuAppMainContentComponent } from './menu-app/menu-app-main-content/menu-app-main-content.component';
import { MailTemplateMainContentComponent } from './mail-template/mail-template-main-content/mail-template-main-content.component';
import { MailTemplateSideBarComponent } from './mail-template/mail-template-side-bar/mail-template-side-bar.component';
import { MailTemplateComponent } from './mail-template/mail-template.component';
import { CKEditorModule } from 'ngx-ckeditor';

const menuRoutes: Routes = [
    {
        path: 'menuApp',
        component: MenuAppComponent,
    },
    {
        path: 'role',
        component: RoleComponent,
    },
    {
        path: 'user',
        component: UserComponent,
    },
    {
        path: 'mailTemplate',
        component: MailTemplateComponent,
    },
];
@NgModule({
    declarations: [
       UserComponent,
       UserSideBarComponent,
       UserMainContentComponent,
       RoleComponent,
       RoleSideBarComponent,
       RoleMainContentComponent,
       MenuAppComponent,
       MenuAppSideBarComponent,
       MenuAppMainContentComponent,
       MailTemplateComponent,
       MailTemplateSideBarComponent,
       MailTemplateMainContentComponent
    ],
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        FuseSharedModule,
        FileUploadModule,
        RouterModule.forChild(menuRoutes),
        CKEditorModule
    ],
    providers: [

    ]
})
export class MasterModule {
}

