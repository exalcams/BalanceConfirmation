import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MailTemplate, AuthenticationDetails } from 'app/models/master';

@Component({
  selector: 'mail-template',
  templateUrl: './mail-template.component.html',
  styleUrls: ['./mail-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MailTemplateComponent implements OnInit {
  MenuItems: string[];
  AllMailTemplates: MailTemplate[] = [];
  SelectedMailTemplate: MailTemplate;
    authenticationDetails: AuthenticationDetails;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
  constructor(private _masterService: MasterService, private _router: Router, public snackBar: MatSnackBar) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('App') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllMailTemplates();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  GetAllMailTemplates(): void {
    this._masterService.GetAllMailTemplates().subscribe(
      (data) => {
        this.AllMailTemplates = <MailTemplate[]>data;
        this.IsProgressBarVisibile = false;
        // console.log(this.AllMailTemplates);
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);      }
    );
  }
  OnMailTemplateSelectionChanged(selectedMailTemplate: MailTemplate): void {
    // console.log(selectedMailTemplate);
    this.SelectedMailTemplate = selectedMailTemplate;
  }
  OnShowProgressBarEvent(status: string): void {
    if (status === 'show') {
      this.IsProgressBarVisibile = true;
    } else {
      this.IsProgressBarVisibile = false;
    }

  }

  RefreshAllMailTemplates(msg: string): void {
    // console.log(msg);
    this.GetAllMailTemplates();
  }


}
