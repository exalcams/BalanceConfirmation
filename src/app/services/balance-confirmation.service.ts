import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BCAttachment, BCFilter, ConfirmationDetails, RejectionDetails } from 'app/models/BalanceConfirmation';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BalanceConfirmationService {
    serviceUrl = "";
    constructor(private http: HttpClient, private _authService: AuthService) {
        this.serviceUrl = this._authService.baseAddress + "api/";
    }

    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
    }

    GetAllBCheaders(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/getallbcheaders")
            .pipe(catchError(this.errorHandler));
    }
    GetAllBCItems(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/getallbcitems")
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCHeader(partnerID: string): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCHeader?PartnerID=" + partnerID)
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCItems(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCItems")
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCItemsByPeroid(partnerID: string): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCItemsByPeroid?partnerID=" + partnerID)
            .pipe(catchError(this.errorHandler));
    }
    AcceptBC(confirmationDetails: ConfirmationDetails): Observable<any> {
        return this.http.post(this.serviceUrl + "balanceconfirmation/AcceptBC", confirmationDetails)
            .pipe(catchError(this.errorHandler));
    }
    RejectBC(rejectionDetails: RejectionDetails): Observable<any> {
        return this.http.post(this.serviceUrl + "balanceconfirmation/RejectBC", rejectionDetails)
            .pipe(catchError(this.errorHandler));
    }
    UploadBCAttachments(bcAttachment: BCAttachment): Observable<any> {
        const formData: FormData = new FormData();
        bcAttachment.Attachments.forEach(doc => {
            formData.append(doc.name, doc, doc.name);
        });
        formData.append('Client', bcAttachment.Client);
        formData.append('Company', bcAttachment.Company);
        formData.append('Type', bcAttachment.Type);
        formData.append('PartnerID', bcAttachment.PartnerID);
        formData.append('FiscalYear', bcAttachment.FiscalYear);
        formData.append('DocNumber', bcAttachment.DocNumber);
        return this.http.post<any>(`${this.serviceUrl}balanceconfirmation/AddBCAttachment`,
            formData
        ).pipe(catchError(this.errorHandler));
    }
    DownloadAttachment(attachmentID: number): Observable<Blob | string> {
        return this.http.get(`${this.serviceUrl}balanceconfirmation/DownloadAttachment?ID=${attachmentID}`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }
    GetAttachments(filter: BCFilter): Observable<any> {
        return this.http.post(this.serviceUrl + "balanceconfirmation/GetAttachments", filter)
            .pipe(catchError(this.errorHandler));
    }

}
