import { Component, OnInit } from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

import * as _ from 'lodash';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css']
})
export class MyComponentComponent implements OnInit {
  mainForm: FormGroup; // 생성된 폼 저장
  selectFileNames: any;
  show: boolean;
  fileList: any;
  fileNames: any;
  subscriptionList: any[];
  apiCommonS: any;
  userNo: any;
  apiMypageService: any;
  dataModel: any;
  alertService: any;
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
  }
  mainFormCreate() {
    this.mainForm = this.fb.group({
      consultingCategoryCode: new FormControl('', [Validators.required]),
      bookingItemCode: new FormControl('', [Validators.required]),
      consultingTypeCode: new FormControl(0, [Validators.required]),
      questionDetail: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      selectFileNames: new FormArray([])
    });

    this.addSelectFiles();
  }
  addClick() {
    this.addSelectFiles();
  }

  deleteClick(index?: number) {

    if (this.selectFileNames.value.length === 1) {
      return false;
    }
    if (index) {
      this.selectFileNames.removeAt(index);
    } else {
      this.selectFileNames.removeAt(this.selectFileNames.length - 1);
    }
  }

  addSelectFiles() {
    if (this.selectFileNames.length >= 3) {
      this.show = true;
      return false;
    }
    const control = new FormControl('', Validators.required) || null;
    this.selectFileNames.push(control);
  }
  onFileChange(event: any, index: number) {
    if (event.target.files.length > 0) {
      // For Preview
      const file: File = event.target.files[0];
      this.fileList[index] = file;
      this.mainForm.controls.selectFileNames['controls'][index].setValue(file.name);
    }

    this.fileNames[index] = this.mainForm.controls.selectFileNames['controls'][index].value;

  }



  private subscribeInit(): void {
    const formData: FormData = new FormData();

    this.fileList.forEach((file) => {
      formData.append('file', file);
    });

    this.subscriptionList = [
      this.apiCommonS.PUT_FILEUPLOAD(formData, 'consulting', new Date().getTime())
        .subscribe(
          (res: any): void => {
            console.log(res);

          }
        )
    ];
  }
  async writeComplete() {


    const rqInfo =
    {
      stationTypeCode: environment,
      currency: 'KRW',
      language: 'KO',
      condition: {
        consultingCategoryCode: this.mainForm.get('consultingCategoryCode').value,
        consultingTypeCode: this.mainForm.get('consultingTypeCode').value,
        userNo: this.userNo,
        smsReceiveYn: true,
        questionTitle: String(new Date().getTime()),
        questionDetail: this.mainForm.get('questionDetail').value,
        bookingItemCode: this.mainForm.get('bookingItemCode').value,

      },

    };

    if (this.mainForm.controls.selectFileNames.value.length > 0) {
      this.mainForm.controls.selectFileNames.value.forEach((file, index) => {
        rqInfo.condition[`attachedFileName${++index}`] = file;
      });
    }


    this.subscribeInit();
    console.log(rqInfo, 'rqInfo');

    this.subscriptionList.push(
      this.apiMypageService.PUT_CONSULTING(rqInfo)
        .subscribe(
          (res: any) => {
            if (res.succeedYn) {
              this.modalClose();
              this.dataModel.response = _.cloneDeep(res.result);
              this.dataModel.transactionSetId = res.transactionSetId;
              this.dataModel.form = this.mainForm;
              console.log('성공이다~~~~');

              this.upsertOne({
                id: 'my-qna-list',
                result: this.dataModel.response
              });

            } else {
              this.alertService.showApiAlert(res.errorMessage);
            }
          },
          (err: any) => {
            console.log('error');
            this.alertService.showApiAlert(err.error.errorMessage);
          }
        )
    );
    this.mainForm.getRawValue();

  }
  modalClose() {
    throw new Error('Method not implemented.');
  }
  upsertOne(arg0: { id: string; result: any; }) {
    throw new Error('Method not implemented.');
  }
}
