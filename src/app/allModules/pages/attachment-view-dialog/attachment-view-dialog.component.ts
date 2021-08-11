import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog, MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { saveAs } from 'file-saver';
import { BalanceConfirmationService } from 'app/services/balance-confirmation.service';
import { BalanceConfirmationHeader, BCAttachments, BCFilter } from 'app/models/BalanceConfirmation';


@Component({
  selector: 'attachment-view-dialog',
  templateUrl: './attachment-view-dialog.component.html',
  styleUrls: ['./attachment-view-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AttachmentViewDialogComponent implements OnInit {
  isProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  bcHeader: BalanceConfirmationHeader;
  Attachments:BCAttachments[]=[];

  constructor(
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    public matDialogRef: MatDialogRef<AttachmentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private _bcService: BalanceConfirmationService,
  ) {
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.bcHeader = this.dialogData.header;
  }

  ngOnInit(): void {
    this.GetAttachments(this.bcHeader);
  }

  GetAttachments(header:BalanceConfirmationHeader){
    var filter=new BCFilter();
    filter.Client=header.Client;
    filter.Company=header.Company;
    filter.FiscalYear=header.FiscalYear;
    filter.PartnerID=header.PartnerID;
    filter.Type=header.Type;
    this._bcService.GetAttachments(filter).subscribe(res=>{
      this.Attachments=<BCAttachments[]>res;
    });
  }
  
  OpenAttachment(attachment:BCAttachments): void {
    this.isProgressBarVisibile = true;
    this._bcService.DownloadAttachment(attachment.AttachmentID).subscribe(
      data => {
        if (data) {
          let fileType = 'image/jpg';
          fileType = attachment.AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
          attachment.AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
          attachment.AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
          attachment.AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' :
          attachment.AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
          const blob = new Blob([data], { type: fileType });
          if(fileType=='image/jpg' || fileType=='image/jpeg' || fileType=='image/png' || fileType=='image/gif' || fileType=='application/pdf'){
            this.openAttachmentDialog(attachment.AttachmentName, blob);
          }
          else{
            saveAs(blob,attachment.AttachmentName);
          }
        }
        this.isProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.isProgressBarVisibile = false;
      }
    );
  }
  openAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: any = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

}
