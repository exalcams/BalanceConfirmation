import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BalanceConfirmationHeader } from 'app/models/BalanceConfirmation';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { BalanceConfirmationService } from 'app/services/balance-confirmation.service';
import { AttachmentViewDialogComponent } from '../attachment-view-dialog/attachment-view-dialog.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ReportComponent implements OnInit {
  balanceConfirmationDataSource: MatTableDataSource<any>;
  balanceConfirmationDisplayedColumns: string[];
  @ViewChild(MatPaginator) balanceConfirmationPaginator: MatPaginator;
  @ViewChild(MatSort) balanceConfirmationSort: MatSort;
  AllColumns=["PartnerID", "FiscalYear", "BalDate", "AcceptedOn", "RejectedOn", "Remarks","Attachments"]
  AcceptedColumns = ["PartnerID", "FiscalYear", "BalDate", "AcceptedOn"];
  RejectedColumns = ["PartnerID", "FiscalYear", "BalDate", "RejectedOn", "Remarks","Attachments"];
  NotRespodedColumns = ["PartnerID", "FiscalYear", "BalDate"];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  AllHeaders:BalanceConfirmationHeader[]=[];
  AcceptedHeaders:BalanceConfirmationHeader[]=[];
  RejectedHeaders:BalanceConfirmationHeader[]=[];
  NotRespondedHeaders:BalanceConfirmationHeader[]=[];
  searchText:string;

  constructor(
    public snackBar: MatSnackBar,
    private _bcService: BalanceConfirmationService,
    private dialog:MatDialog
  ) {
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    this.GetReportTableData();
  }

  GetReportTableData(){
    this.isProgressBarVisibile=true;
    this._bcService.GetAllBCheaders().subscribe((data)=>{
      var headers=<BalanceConfirmationHeader[]>data;
      this.AllHeaders=headers.filter(x=>x.Status!=null);
      this.LoadTable(1);
      this.AcceptedHeaders=this.AllHeaders.filter(x=>x.Status=="Accepted");
      this.RejectedHeaders=this.AllHeaders.filter(x=>x.Status=="Rejected");
      this.NotRespondedHeaders=this.AllHeaders.filter(x=>x.Status=="NR");
      this.isProgressBarVisibile=false;
    },
    err=>{
      this.isProgressBarVisibile=false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }

  Tab1Clicked() {
    this.LoadTable(1);
  }
  Tab2Clicked() {
    this.LoadTable(2);
  }
  Tab3Clicked() {
    this.LoadTable(3);
  }
  Tab4Clicked() {
    this.LoadTable(4);
  }

  LoadTable(tab: number) {
    if (tab == 1) {
      this.balanceConfirmationDisplayedColumns = this.NotRespodedColumns;
      this.balanceConfirmationDataSource=new MatTableDataSource(this.AllHeaders);
    }
    else if (tab == 2) {
      this.balanceConfirmationDisplayedColumns = this.AcceptedColumns;
      this.balanceConfirmationDataSource=new MatTableDataSource(this.AcceptedHeaders);
    }
    else if (tab == 3) {
      this.balanceConfirmationDisplayedColumns = this.RejectedColumns;
      this.balanceConfirmationDataSource=new MatTableDataSource(this.RejectedHeaders);
    }
    else {
      this.balanceConfirmationDisplayedColumns = this.NotRespodedColumns;
      this.balanceConfirmationDataSource=new MatTableDataSource(this.NotRespondedHeaders);
    }
    this.balanceConfirmationDataSource.sort=this.balanceConfirmationSort;
    this.balanceConfirmationDataSource.paginator=this.balanceConfirmationPaginator;
  }
  openAttachmentViewDialog(bcHeader:BalanceConfirmationHeader): void {
    const dialogConfig: MatDialogConfig = {
      data: { header:bcHeader },
      panelClass: "attachment-view-dialog",
    };
    const dialogRef = this.dialog.open(
      AttachmentViewDialogComponent,
      dialogConfig
    );
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.balanceConfirmationDataSource.filter = filterValue.trim().toLowerCase();
  }

}
