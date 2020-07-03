import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

export const apiRoot = environment.base_url;
export const proxy = environment.proxy_url;

declare global {
  interface Window { MyNamespace: any; }
}

window.MyNamespace = window.MyNamespace || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Redmine Activity Tracker';
  updated = '';
  userId = '';
  key = '66103e0fe6fb9b22e79b865835e9c0eb939e73ba';

  activities: any[] = [];
  formSubmitted: boolean;
  dataLoaded: boolean;
  dataError: boolean;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  getActivities(e) {
    e.preventDefault();
    if (this.userId && this.key) {
      this.dataLoaded = false;
      this.formSubmitted = true;
      this.getActivityOfUser(this.key, this.userId);
    } else {
      window.alert('Please enter employee id and ATOM secret key');
    }
  }

  getActivityOfUser(key: string, uid: string) {
    const url = `${proxy}/${apiRoot}/activity.atom?key=${key}&user_id=${uid}`
    this.http.get(url, { responseType: 'text' }).subscribe((res) => {
      this.dataLoaded = true;
      //Everything else the same
      if (window.DOMParser) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(res, "text/xml");
        if (!xmlDoc) {
          this.dataError = true;
          window.alert('Failed to load data. Try again later.');
          this.formSubmitted = false;
          return;
        }
        this.dataError = false;
        this.title = xmlDoc.getElementsByTagName("title")[0].innerHTML;
        this.updated = xmlDoc.getElementsByTagName("updated")[0].innerHTML;
        const activities: any = xmlDoc.getElementsByTagName("entry");
        for (let item of activities) {
          const obj = {
            title: item.getElementsByTagName('title')[0].innerHTML,
            updated: item.getElementsByTagName('updated')[0].innerHTML,
            link: item.getElementsByTagName('id')[0].innerHTML,
            content: this.getContentTexts(item.getElementsByTagName('content')[0].innerHTML),
            author: item.getElementsByTagName('author')[0].getElementsByTagName('name')[0].innerHTML
          }
          this.activities.push(obj);
        }
      } else {
        window.alert('Results cannot be displayed as, there\'s no support for XML parsing.');
      }
    }, (err) => {
      this.dataError = true;
      this.formSubmitted = false;
      window.alert('Failed to load data. Try again later.');
      console.log(err);

    });
  }

  getContentTexts(s: any) {
    const html = this.stringToHTML(s);
    const paras = html.split('&lt;/p&gt;');
    const p1 = paras.map(p => p.replace('&lt;p&gt;', '').trim());
    const output = p1.map(p => {
      const lines = p.split('&lt;br /&gt;');
      return lines;
    });
    return output;
  }

  stringToHTML(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.innerHTML;
  };

  reset() {
    this.formSubmitted = false;
    this.userId = '';
    this.dataLoaded = false;
    this.dataError = false;
  }

}
