import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';
import { MailTemplate, AuthenticationDetails } from 'app/models/master';

@Component({
  selector: 'mail-template-main-content',
  templateUrl: './mail-template-main-content.component.html',
  styleUrls: ['./mail-template-main-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MailTemplateMainContentComponent implements OnInit, OnChanges {
  @Input() currentSelectedMailTemplate: MailTemplate = new MailTemplate();
  @Output() SaveSucceed: EventEmitter<string> = new EventEmitter<string>();
  @Output() ShowProgressBarEvent: EventEmitter<string> = new EventEmitter<string>();
  mailTemplate: MailTemplate;
  mailTemplateMainFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  authenticationDetails: AuthenticationDetails;

  constructor(private _masterService: MasterService, private _formBuilder: FormBuilder, private _router: Router,
    public snackBar: MatSnackBar, private dialog: MatDialog) {
    this.mailTemplateMainFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      Subject:['',Validators.required],
      Body:['']
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.mailTemplate = new MailTemplate();
    this.authenticationDetails = new AuthenticationDetails();
    // this.currentSelectedMailTemplate = new MailTemplate();
    // this.currentSelectedMailTemplate.AppID = 0;
    // if(this.currentSelectedMailTemplate)
    // console.log(this.currentSelectedMailTemplate);
  }

  ngOnInit(): void {
    // console.log(this.currentSelectedMailTemplate);
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    // this.mailTemplateMainFormGroup.get('appName').patchValue('');
    this.mailTemplate = new MailTemplate();
    this.mailTemplateMainFormGroup.reset();
    Object.keys(this.mailTemplateMainFormGroup.controls).forEach(key => {
      this.mailTemplateMainFormGroup.get(key).markAsUntouched();
    });

  }

  SaveClicked(): void {
    if (this.mailTemplateMainFormGroup.valid) {
      if (this.mailTemplate.TemplateID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'update',
            Catagory: 'template'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.mailTemplate.Type = this.mailTemplateMainFormGroup.get('Type').value;
              this.mailTemplate.Subject = this.mailTemplateMainFormGroup.get('Subject').value;
              this.mailTemplate.Body = this.mailTemplateMainFormGroup.get('Body').value;
              this.mailTemplate.ModifiedBy = this.authenticationDetails.UserID.toString();
              this._masterService.UpdateMailTemplate(this.mailTemplate).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('Template updated successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('Template updated successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          });

      } else {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'create',
            Catagory: 'template'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.mailTemplate = new MailTemplate();
              this.mailTemplate.Type = this.mailTemplateMainFormGroup.get('Type').value;
              this.mailTemplate.Subject = this.mailTemplateMainFormGroup.get('Subject').value;
              this.mailTemplate.Body = this.mailTemplateMainFormGroup.get('Body').value;
              this.mailTemplate.CreatedBy = this.authenticationDetails.UserID.toString();
              this._masterService.CreateMailTemplate(this.mailTemplate).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('Template created successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('Template created successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.mailTemplateMainFormGroup.controls).forEach(key => {
        this.mailTemplateMainFormGroup.get(key).markAsTouched();
        this.mailTemplateMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  DeleteClicked(): void {
    if (this.mailTemplateMainFormGroup.valid) {
      if (this.mailTemplate.TemplateID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'delete',
            Catagory: 'template'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.mailTemplate.Type = this.mailTemplateMainFormGroup.get('Type').value;
              this.mailTemplate.Subject = this.mailTemplateMainFormGroup.get('Subject').value;
              this.mailTemplate.Body = this.mailTemplateMainFormGroup.get('Body').value;
              this.mailTemplate.ModifiedBy = this.authenticationDetails.UserID.toString();
              this._masterService.DeleteMailTemplate(this.mailTemplate).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('Template deleted successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('Template deleted successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.mailTemplateMainFormGroup.controls).forEach(key => {
        this.mailTemplateMainFormGroup.get(key).markAsTouched();
        this.mailTemplateMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentSelectedMailTemplate) {
      this.mailTemplate = new MailTemplate();
      this.mailTemplate.TemplateID = this.currentSelectedMailTemplate.TemplateID;
      this.mailTemplate.Type = this.currentSelectedMailTemplate.Type;
      this.mailTemplate.Subject = this.currentSelectedMailTemplate.Subject;
      this.mailTemplate.Body = this.currentSelectedMailTemplate.Body;
      this.mailTemplate.IsActive = this.currentSelectedMailTemplate.IsActive;
      this.mailTemplate.CreatedBy = this.currentSelectedMailTemplate.CreatedBy;
      this.mailTemplate.CreatedOn = this.currentSelectedMailTemplate.CreatedOn;
      this.mailTemplate.ModifiedBy = this.currentSelectedMailTemplate.ModifiedBy;
      this.mailTemplate.ModifiedOn = this.currentSelectedMailTemplate.ModifiedOn;
      this.mailTemplateMainFormGroup.get('Type').patchValue(this.mailTemplate.Type);
      this.mailTemplateMainFormGroup.get('Subject').patchValue(this.mailTemplate.Subject);
      this.mailTemplateMainFormGroup.get('Body').patchValue(this.mailTemplate.Body);
    } else {
      // this.mailTemplateMainFormGroup.get('appName').patchValue('');
      this.ResetControl();
    }
  }

}



