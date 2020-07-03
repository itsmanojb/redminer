import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'html'
})

export class HTMLPipe implements PipeTransform {

  constructor() { }

  transform(value: any) {
    console.log(value);

    return value;
  }
}
