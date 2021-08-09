import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatMenuTrigger, MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthenticationDetails, AppUsage, UserWithRole, UserFilter, Role } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class OverviewComponent implements OnInit {

  fuseConfig: any;
  BGClassName: any;

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  menuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  searchFormGroup: FormGroup;
  isDateError: boolean;
  searchText: string;
  selectValue: string;
  isExpanded: boolean;
  defaultFromDate: Date;
  defaultToDate: Date;
  AllRoles: Role[] = [];
  // overviews: BPCReportOV[] = [];
  overviewDisplayedColumns: string[] = ['UserName', 'RoleName', 'DisplayName', 'Email', 'ContactNumber', 'IsEnabled'];
  overviewDataSource: MatTableDataSource<UserWithRole>;
  overviews: UserWithRole[] = [];
  @ViewChild(MatPaginator) overviewPaginator: MatPaginator;
  @ViewChild(MatSort) overviewSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;


  constructor(
    private _fuseConfigService: FuseConfigService,
    private _authService: AuthService,
    // private _reportService: ReportService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _masterService: MasterService,
    // private _POService: POService,
    private _datePipe: DatePipe,
    private _excelService: ExcelService
  ) {
    // this.SecretKey = this._authService.SecretKey;
    // this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = false;
    this.isDateError = false;
    this.searchText = '';
    this.selectValue = 'All';
    this.isExpanded = false;
    this.defaultFromDate = new Date();
    this.defaultFromDate.setDate(this.defaultFromDate.getDate() - 30);
    this.defaultToDate = new Date();
  }

  ngOnInit(): void {
    this.SetUserPreference();
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('Overview') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.InitializeSearchForm();
    this.GetVCRoles();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Overview';
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.currentUserName;
    appUsage.ModifiedBy = this.currentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      (data) => {
      },
      (err) => {
        console.error(err);
      }
    );
  }

  InitializeSearchForm(): void {
    this.searchFormGroup = this.formBuilder.group({
      RoleID: [''],
      IsEnabled: ['']
      // FromDate: [this.defaultFromDate],
      // ToDate: [this.defaultToDate]
    });
  }

  resetControl(): void {
    this.overviews = [];
    this.resetFormGroup(this.searchFormGroup);
  }

  resetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  GetVCRoles(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetVCRoles().subscribe(
      (data) => {
        this.AllRoles = data as Role[];
        this.isProgressBarVisibile = false;
        this.searchButtonClicked();
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  searchButtonClicked(): void {
    if (this.searchFormGroup.valid) {
    
      const filter: UserFilter = new UserFilter();
      filter.RoleID = this.searchFormGroup.get('RoleID').value ? this.searchFormGroup.get('RoleID').value : null;
      const IsEnabled = this.searchFormGroup.get('IsEnabled').value;
      if (IsEnabled) {
        filter.IsEnabled = IsEnabled === 'true' ? true : false;
      } else {
        filter.IsEnabled = null;
      }
      this.FilterUsers(filter);
      // }
    } else {
      this.showValidationErrors(this.searchFormGroup);
    }
  }

  FilterUsers(filter: UserFilter): void {
    this.isProgressBarVisibile = true;
    this._masterService.FilterUsers(filter).subscribe(
      (data) => {
        this.overviews = data as UserWithRole[];
        this.overviewDataSource = new MatTableDataSource(this.overviews);
        this.overviewDataSource.paginator = this.overviewPaginator;
        this.overviewDataSource.sort = this.overviewSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  showValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });

  }

  exportAsXLSX(): void {
   
    const currentPageIndex = this.overviewDataSource.paginator.pageIndex;
    const PageSize = this.overviewDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.overviews.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'User Name': x.UserName,
        'Role Name': x.RoleName,
        'DisplayName': x.DisplayName,
        'Email': x.Email,
        'ContactNumber': x.ContactNumber,
        'Enabled': x.IsEnabled,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'overview');
  }

  expandClicked(): void {
    // this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    // this.CreateActionLogvalues("SearchFilter");
    const filterValue = (event.target as HTMLInputElement).value;
    this.overviewDataSource.filter = filterValue.trim().toLowerCase();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
 
}
