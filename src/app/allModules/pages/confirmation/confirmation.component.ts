import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatMenuTrigger, MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { BalanceConfirmationHeader, BalanceConfirmationItem, BCAttachment, ConfirmationDetails, RejectionDetails } from 'app/models/BalanceConfirmation';
import { AuthenticationDetails } from 'app/models/master';
import { GreetingDialogComponent } from 'app/notifications/greeting-dialog/greeting-dialog.component';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { BalanceConfirmationService } from 'app/services/balance-confirmation.service';
import { ExcelService } from 'app/services/excel.service';
import { Guid } from 'guid-typescript';
import { RejectionDialogComponent } from '../rejection-dialog/rejection-dialog.component';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmationComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: number;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  confirmationDetails: ConfirmationDetails;
  isProgressBarVisibile: boolean;
  isAccepted = false;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  fuseConfig: any;
  @ViewChild(MatPaginator) balanceConfirmationPaginator: MatPaginator;
  @ViewChild(MatSort) balanceConfirmationSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  BGClassName: any;
  BCHeader: BalanceConfirmationHeader;
  BCItems: BalanceConfirmationItem[];
  balanceConfirmationDataSource: MatTableDataSource<BalanceConfirmationItem>;
  balanceConfirmationDisplayedColumns = ['FiscalYear', 'DocNumber', 'DocDate', 'InvoiceNumber', 'InvoiceAmount', 'BillAmount', 'PaidAmont',
    'TDSAmount', 'TotalPaidAmount', 'DownPayment', 'NetDueAmount', 'Currency', 'BalDate'];
  // SecretKey: string;
  // SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _bcService: BalanceConfirmationService,
    private _excelService: ExcelService,
    private _authService: AuthService,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private _router: Router,
    private dialog: MatDialog,
  ) {
    // this.SecretKey = this._authService.SecretKey;
    // this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.confirmationDetails = new ConfirmationDetails();
    this.BCHeader = new BalanceConfirmationHeader();
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('ASN') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetHeader();
    this.GetBCTableData();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  GetHeader(): void {
    this.isProgressBarVisibile = true;
    this._bcService.GetCurrentBCHeader(this.currentUserName).subscribe((data: BalanceConfirmationHeader) => {
      this.BCHeader = data;
      this.isProgressBarVisibile = false;
    },
      err => {
        console.log(err);
        this.isProgressBarVisibile = false;
      });
  }

  GetBCTableData(): void {
    this.isProgressBarVisibile = true;
    this._bcService.GetCurrentBCItemsByPeroid(this.currentUserName).subscribe((data: BalanceConfirmationItem[]) => {
      this.BCItems = data;
      this.balanceConfirmationDataSource = new MatTableDataSource(this.BCItems);
      this.balanceConfirmationDataSource.paginator = this.balanceConfirmationPaginator;
      this.balanceConfirmationDataSource.sort = this.balanceConfirmationSort;
      this.isProgressBarVisibile = false;
      // console.log(data);
    },
      (err) => {
        this.isProgressBarVisibile = false;
      });
  }

  exportAsXLSX(): void {
    const currentPageIndex = this.balanceConfirmationDataSource.paginator.pageIndex;
    const PageSize = this.balanceConfirmationDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.BCItems.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Period': x.FiscalYear,
        'DocNumber': x.DocNumber,
        'DocDate': x.DocDate ? this._datePipe.transform(x.DocDate, 'dd-MM-yyyy') : '',
        'InvoiceNumber': x.InvoiceNumber,
        'InvoiceAmount': x.InvoiceAmount,
        'BillAmount': x.BillAmount,
        'PaidAmount': x.PaidAmont,
        'TDSAmount': x.TDSAmount,
        'TotalPaidAmount': x.TotalPaidAmount,
        'DownPayment': x.DownPayment,
        'NetDueAmount': x.NetDueAmount,
        'Currency': x.Currency,
        'BalDate': x.BalDate,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'BalanceConfirmation');
  }

  RejectBalance(): void {
    this.OpenRejectionDialog();
    // if (this.BCHeader.Status !== 'Rejected') {
    //   this.OpenRejectionDialog();
    // } else {
    //   this.notificationSnackBarComponent.openSnackBar('Sorry! Details have been rejected already', SnackBarStatus.danger);
    // }
  }
  AcceptBalance(): void {
    // this.OpenGreetingDialog();
    this.OpenConfirmationDialog('Accept', 'Balance');
    // if (this.BCHeader.Status !== 'Accepted') {
    //   this.OpenConfirmationDialog('Accept', 'Balance');
    // } else {
    //   this.notificationSnackBarComponent.openSnackBar('Sorry! Details have been accepted already', SnackBarStatus.danger);
    // }
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.AcceptBC();
        }
      });
  }

  OpenRejectionDialog(): void {
    const dialogConfig: MatDialogConfig = {
      panelClass: 'rejection-dialog'
    };
    const dialogRef = this.dialog.open(RejectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.RejectBC(result);
        }
      });
  }

  AcceptBC(): void {
    this.isProgressBarVisibile = true;
    this.confirmationDetails = new ConfirmationDetails();
    this.confirmationDetails.ConfirmedBy = this.currentUserName;
    this.confirmationDetails.PartnerID = this.currentUserName;
    this._bcService.AcceptBC(this.confirmationDetails).subscribe(x => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Balance Confirmed', SnackBarStatus.success);
      this.OpenGreetingDialog();
    }, err => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }

  RejectBC(Res: any): void {
    // RejectBC(remarks: string): void {
    this.isProgressBarVisibile = true;
    const rejectionDetails = new RejectionDetails();
    rejectionDetails.RejectedBy = this.currentUserName;
    rejectionDetails.PartnerID = this.currentUserName;
    rejectionDetails.Remarks = Res.Remarks;
    const uploadAttachment = new BCAttachment();
    uploadAttachment.Client = this.BCHeader.Client;
    uploadAttachment.Company = this.BCHeader.Company;
    uploadAttachment.Type = this.BCHeader.Type;
    uploadAttachment.FiscalYear = this.BCHeader.FiscalYear;
    uploadAttachment.PartnerID = this.BCHeader.PartnerID;
    uploadAttachment.Attachments = Res.Attachments;
    this._bcService.RejectBC(rejectionDetails).subscribe(x => {
      this._bcService.UploadBCAttachments(uploadAttachment).subscribe(res => {
        this.isProgressBarVisibile = false;
      },
        err => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'attachment not uploaded' : err, SnackBarStatus.danger);
        });
      this.notificationSnackBarComponent.openSnackBar('Balance Rejected', SnackBarStatus.success);
      this.OpenGreetingDialog();
    },
      err => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      });
  }

  OpenGreetingDialog(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Message: 'Thank you for submitting your response 😊'
      },
      panelClass: 'greeting-dialog'
    };
    const dialogRef = this.dialog.open(GreetingDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        this._router.navigate(['auth/login']);
      });
    //     this.isProgressBarVisibile = false;
    //     this.notificationSnackBarComponent.openSnackBar('Balance Rejected', SnackBarStatus.success);
    //   }, err => {
    //   this.isProgressBarVisibile = false;
    //   this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    // });
  }

}
