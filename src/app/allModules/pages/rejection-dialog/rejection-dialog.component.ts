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
  Attachments:File[]=[];
  RejectionRemarks:FormControl=new FormControl('',Validators.required);

  constructor(
    public matDialogRef: MatDialogRef<RejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
  }

  YesClicked(): void {
    if(this.RejectionRemarks.valid){
      this.matDialogRef.close({Remarks:this.RejectionRemarks.value,Attachments:this.Attachments});
    }
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);
  }

  onSelect(event) {
    event.addedFiles.forEach(doc => {
      this.Attachments.push(doc);
    });
  }
  onRemove(event) {
    this.Attachments.splice(this.Attachments.indexOf(event), 1);
  }

}
