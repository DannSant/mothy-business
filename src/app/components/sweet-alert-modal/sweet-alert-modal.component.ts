import {  Component } from '@angular/core';
import Swal from 'sweetalert2';

export interface QuestionAlertData {
  title: string;
  text: string;
  confirmText?: string;
  denyText?: string;
  icon: 'success' | 'error' | 'warning' | 'info' | 'question';
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  acceptFunction?: () => void;
  denyFunction?: () => void;
}

@Component({
  selector: 'sweet-alert-modal',
  imports: [],
  templateUrl: './sweet-alert-modal.component.html',

})
export class SweetAlertModalComponent {
  showQuestionAlert({title,text,confirmText,denyText,acceptFunction,denyFunction}: QuestionAlertData) {
    Swal.fire({
      title,
      text,
      showDenyButton: true,
      confirmButtonText: confirmText,
      denyButtonText: denyText
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
       if(acceptFunction){
        acceptFunction();
       }
      } else if (result.isDenied) {
        if(denyFunction){
          denyFunction();
        }

      }
    });
  }


 }
