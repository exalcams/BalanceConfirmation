import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BalanceConfirmationHeader } from 'app/models/BalanceConfirmation';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { BalanceConfirmationService } from 'app/services/balance-confirmation.service';

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
  AcceptedColumns = ["PartnerID", "FiscalYear", "BalDate", "AcceptedOn"];
  RejectedColumns = ["PartnerID", "FiscalYear", "BalDate", "RejectedOn", "Remarks"];
  Columns = ["PartnerID", "FiscalYear", "BalDate"];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  AllHeaders:BalanceConfirmationHeader[]=[];
  AcceptedHeaders:BalanceConfirmationHeader[]=[];
  RejectedHeaders:BalanceConfirmationHeader[]=[];
  NotRespondedHeaders:BalanceConfirmationHeader[]=[];

  constructor(
    public snackBar: MatSnackBar,
    private _bcService: BalanceConfirmationService,
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
      this.AllHeaders=<BalanceConfirmationHeader[]>data;
      this.LoadTable(1);
      this.AcceptedHeaders=this.AllHeaders.filter(x=>x.Status=="Accepted");
      this.RejectedHeaders=this.AllHeaders.filter(x=>x.Status=="Rejected");
      this.NotRespondedHeaders=this.AllHeaders.filter(x=>x.Status!="Accepted" && x.Status!="Rejected");
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
      this.balanceConfirmationDisplayedColumns = this.Columns;
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
      this.balanceConfirmationDisplayedColumns = this.Columns;
      this.balanceConfirmationDataSource=new MatTableDataSource(this.NotRespondedHeaders);
    }
    this.balanceConfirmationDataSource.sort=this.balanceConfirmationSort;
    this.balanceConfirmationDataSource.paginator=this.balanceConfirmationPaginator;
  }

}
