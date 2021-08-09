import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-rejection-dialog',
  templateUrl: './rejection-dialog.component.html',
  styleUrls: ['./rejection-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class RejectionDialogComponent implements OnInit {

  RejectionRemarks:FormControl=new FormControl('',Validators.required);
  constructor(
    public matDialogRef: MatDialogRef<RejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  YesClicked(): void {
    if(this.RejectionRemarks.valid){
      this.matDialogRef.close(this.RejectionRemarks.value);
    }
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);
  }

}
