import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar } from '@angular/material';
import { MailTemplate } from 'app/models/master';

@Component({
  selector: 'mail-template-side-bar',
  templateUrl: './mail-template-side-bar.component.html',
  styleUrls: ['./mail-template-side-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MailTemplateSideBarComponent implements OnInit, OnChanges {

  searchText: string;
  selectID: number;
  @Input() AllMailTemplates: MailTemplate[] = [];
  @Output() MailTemplateSelectionChanged: EventEmitter<MailTemplate> = new EventEmitter<MailTemplate>();
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(public snackBar: MatSnackBar) {
    this.searchText = '';
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    // if (this.AllMailTemplates.length > 0) {
    //   this.selectID = this.AllMailTemplates[0].AppID;
    // }
  }


  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.currentSelectedMailTemplate);
    if (this.AllMailTemplates.length > 0) {
      this.selectID = this.AllMailTemplates[0].TemplateID;
      this.loadSelectedMailTemplate(this.AllMailTemplates[0]);
    }
  }

  loadSelectedMailTemplate(SelectedMailTemplate: MailTemplate): void {
    this.selectID = SelectedMailTemplate.TemplateID;
    this.MailTemplateSelectionChanged.emit(SelectedMailTemplate);
    // console.log(SelectedMailTemplate);
  }

  clearMailTemplate(): void {
    this.selectID = 0;
    this.MailTemplateSelectionChanged.emit(null);
  }

}
