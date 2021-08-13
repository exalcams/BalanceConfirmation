import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatMenuTrigger, MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthenticationDetails, AppUsage, UserWithRole, UserFilter, Role, EnabledCount, DisabledCount } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';


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
  currentUserID: number;
  currentUserName: string;
  currentUserRole: string;
  menuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  IsProgressBarVisibile2: boolean;
  searchFormGroup: FormGroup;
  isDateError: boolean;
  searchText: string;
  selectValue: string;
  isExpanded: boolean;
  defaultFromDate: Date;
  defaultToDate: Date;
  enabledCount: EnabledCount;
  disabledCount: DisabledCount;
  AllRoles: Role[] = [];
  SelectedRole = 'Users';
  SelectedStatus = 'All';
  // overviews: BPCReportOV[] = [];
  overviewDisplayedColumns: string[] = ['Select', 'UserName', 'RoleName', 'DisplayName', 'Email', 'ContactNumber', 'IsEnabled'];
  overviewDataSource: MatTableDataSource<UserWithRole>;
  overviews: UserWithRole[] = [];
  @ViewChild(MatPaginator) overviewPaginator: MatPaginator;
  @ViewChild(MatSort) overviewSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  selection = new SelectionModel<UserWithRole>(true, []);

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
    this.IsProgressBarVisibile = false;
    this.isDateError = false;
    this.enabledCount = new EnabledCount();
    this.disabledCount = new DisabledCount();
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
    this.GetEnabledCount();
    this.GetDisabledCount();
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
  GetEnabledCount(): void {
    this.IsProgressBarVisibile1 = true;
    this._masterService.GetEnabledCount().subscribe(
      (data) => {
        this.enabledCount = data as EnabledCount;
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
      }
    );
  }
  GetDisabledCount(): void {
    this.IsProgressBarVisibile2 = true;
    this._masterService.GetDisabledCount().subscribe(
      (data) => {
        this.disabledCount = data as DisabledCount;
        this.IsProgressBarVisibile2 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile2 = false;
      }
    );
  }

  GetVCRoles(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetVCRoles().subscribe(
      (data) => {
        this.AllRoles = data as Role[];
        this.IsProgressBarVisibile = false;
        this.searchButtonClicked();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
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
      this.selection.clear();
      this.FilterUsers(filter);
      // }
    } else {
      this.showValidationErrors(this.searchFormGroup);
    }
  }

  GetRoleName(RoleID?: number): void {
    if (RoleID) {
      const rol = this.AllRoles.filter(x => x.RoleID === RoleID)[0];
      if (rol) {
        this.SelectedRole = rol.RoleName;
      } else {
        this.SelectedRole = 'Users';
      }
    } else {
      this.SelectedRole = 'Users';
    }
  }
  GetSelectedStatus(): void {
    const IsEnabled = this.searchFormGroup.get('IsEnabled').value;
    this.SelectedStatus = IsEnabled;
    if (IsEnabled) {
    } else {
      this.SelectedStatus = 'All';
    }
  }

  FilterUsers(filter: UserFilter): void {
    this.IsProgressBarVisibile = true;
    this._masterService.FilterUsers(filter).subscribe(
      (data) => {
        this.overviews = data as UserWithRole[];
        this.overviewDataSource = new MatTableDataSource(this.overviews);
        this.overviewDataSource.paginator = this.overviewPaginator;
        this.overviewDataSource.sort = this.overviewSort;
        this.IsProgressBarVisibile = false;
        this.GetRoleName(filter.RoleID);
        this.GetSelectedStatus();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.SelectedRole = 'Users';
        this.SelectedStatus = 'All';
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.overviewDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.overviewDataSource.data.forEach(x => {
      this.selection.select(x);
    });
  }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: UserWithRole): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  // }

  enableAllClicked(): void {
    if (this.SelectedRole === 'Vendor') {
      this.EnableAllVendors();
    } else if (this.SelectedRole === 'Customer') {
      this.EnableAllCustomers();
    } else {
      this.EnableAllUsers();
    }
  }
  sendMailToAllClicked(): void {
    if (this.SelectedRole === 'Vendor') {
      this.SendMailToAllVendors();
    } else if (this.SelectedRole === 'Customer') {
      this.SendMailToAllCustomers();
    } else {
      this.SendMailToAllUsers();
    }
  }
  disbleAllClicked(): void {
    if (this.SelectedRole === 'Vendor') {
      this.DisableAllVendors();
    } else if (this.SelectedRole === 'Customer') {
      this.DisableAllCustomers();
    } else {
      this.DisableAllUsers();
    }
  }
  enableSelectedClicked(): void {
    this.EnableSelectedUsers();
  }
  sendMailToSelectedClicked(): void {
    this.SendMailToSelectedUsers();
  }
  disbleSelectedClicked(): void {
    this.DisableSelectedUsers();
  }

  EnableAllVendors(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.EnableAllVendors().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All vendors are enabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  EnableAllCustomers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.EnableAllCustomers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All customers are enabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  EnableAllUsers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.EnableAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All users are enabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  EnableSelectedUsers(): void {
    this.IsProgressBarVisibile = true;
    const Ids = this.selection.selected.map(x => x.UserID);
    this._masterService.EnableSelectedUsers(Ids).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(`Selected ${this.SelectedRole} are enabled`, SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  DisableAllVendors(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DisableAllVendors().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All vendors are disabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  DisableAllCustomers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DisableAllCustomers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All customers are disabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  DisableAllUsers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DisableAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('All users are disabled', SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  DisableSelectedUsers(): void {
    this.IsProgressBarVisibile = true;
    const Ids = this.selection.selected.map(x => x.UserID);
    this._masterService.DisableSelectedUsers(Ids).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(`Selected ${this.SelectedRole} are disabled`, SnackBarStatus.success);
        this.searchButtonClicked();
        this.GetEnabledCount();
        this.GetDisabledCount();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  SendMailToAllVendors(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.SendMailToAllVendors().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Mail has been sent all vendors', SnackBarStatus.success);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  SendMailToAllCustomers(): void {
    this.IsProgressBarVisibile = true;
    setTimeout(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(`Mail sending initiated`, SnackBarStatus.success);
    }, 3000);
    this._masterService.SendMailToAllCustomers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Mail has been sent all customers', SnackBarStatus.success);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  SendMailToAllUsers(): void {
    this.IsProgressBarVisibile = true;
    setTimeout(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(`Mail sending initiated`, SnackBarStatus.success);
    }, 3000);
    this._masterService.SendMailToAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Mail has been sent all users', SnackBarStatus.success);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  SendMailToSelectedUsers(): void {
    this.IsProgressBarVisibile = true;
    setTimeout(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(`Mail sending initiated`, SnackBarStatus.success);
    }, 3000);
    const Ids = this.selection.selected.map(x => x.UserID);
    this._masterService.SendMailToSelectedUsers(Ids).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(`Mail has been sent to selected ${this.SelectedRole}`, SnackBarStatus.success);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
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
