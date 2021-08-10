import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { DialogData } from '../notification-dialog/dialog-data';

@Component({
  selector: 'app-greeting-dialog',
  templateUrl: './greeting-dialog.component.html',
  styleUrls: ['./greeting-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class GreetingDialogComponent implements OnInit {
  Message:string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<GreetingDialogComponent>,
  ) { 
    this.Message=dialogData.Message;
  }

  ngOnInit() {
  }

}
