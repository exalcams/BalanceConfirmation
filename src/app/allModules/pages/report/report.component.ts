import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BalanceConfirmationHeader } from 'app/models/BalanceConfirmation';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation:ViewEncapsulation.None,
  animations:fuseAnimations
})
export class ReportComponent implements OnInit {
  balanceConfirmationDataSource: MatTableDataSource<any>;
  balanceConfirmationDisplayedColumns:string[];
  @ViewChild(MatPaginator) balanceConfirmationPaginator: MatPaginator;
  @ViewChild(MatSort) balanceConfirmationSort: MatSort;
  AcceptedColumns = ["PartnerID", "FiscalYear", "BalDate", "AcceptedOn"];
  RejectedColumns = ["PartnerID", "FiscalYear", "BalDate", "RejectedOn","Remarks"];
  Columns = ["PartnerID", "FiscalYear", "BalDate"];
  constructor() { 
    
  }

  ngOnInit() {
    // this.balanceConfirmationDisplayedColumns=this.Columns;
    // this.balanceConfirmationDataSource=new MatTableDataSource([1,2,3,4,5,6,7,8,9,10]);
    // this.balanceConfirmationDataSource.sort=this.balanceConfirmationSort;
    // this.balanceConfirmationDataSource.paginator=this.balanceConfirmationPaginator;
  }

  Tab1Clicked(){
    this.LoadTable(1);
  }
  Tab2Clicked(){
    this.LoadTable(2);
  }
  Tab3Clicked(){
    this.LoadTable(3);
  }
  Tab4Clicked(){
    this.LoadTable(4);
  }

  LoadTable(tab:number){
    if(tab==1){
      this.balanceConfirmationDisplayedColumns=this.Columns;
    }
    else if(tab==2){
      this.balanceConfirmationDisplayedColumns=this.AcceptedColumns;
    }
    else if(tab==3){
      this.balanceConfirmationDisplayedColumns=this.RejectedColumns;
    }
    else{
      this.balanceConfirmationDisplayedColumns=this.Columns;
    }
  }

}
