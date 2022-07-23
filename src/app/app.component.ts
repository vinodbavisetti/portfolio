import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { NEVER, Subject, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  lastScrollPosition: number;
  noOfBlocks = 0;
  dontScrollFlag = false;

  scrollHandlerObservable = new Subject<null>();

  @HostListener('document:scroll', ['$event'])
  onScroll(e: MouseEvent) {
    this.scrollHandlerObservable.next(null);
  }

  ngOnInit(): void {
    this.lastScrollPosition = document.documentElement.scrollTop;
    this.scrollHandler();
  }

  ngAfterViewInit(): void {
    this.noOfBlocks = document.querySelectorAll('.page-block').length;
  }

  scrollHandler() {
    let scrollIndex: number;
    let scrollDirection: 'up' | 'down';
    this.scrollHandlerObservable.pipe(
      switchMap(() => {
        const scrollPosition = document.documentElement.scrollTop;
        if (this.lastScrollPosition === scrollPosition) {
          return NEVER;
        }
        scrollIndex = ~~(scrollPosition / innerHeight);
        scrollDirection = this.lastScrollPosition > scrollPosition ? 'up' : 'down';
        this.lastScrollPosition = scrollPosition;
        const remainder = Math.floor(scrollPosition % innerHeight) == 0;
        if (this.dontScrollFlag || remainder) {
          return NEVER; 
        }
        console.log('----')
        return timer(400);
      })
    ).subscribe({
      next: () => {
        if (scrollDirection === 'down') {
          this.goToThatBlock(scrollIndex + 1);
        } else {
          this.goToThatBlock(scrollIndex);
        } 
      }
    })
  }

  goToThatBlock(index: number, dontScrollFlag = false) {
    this.dontScrollFlag = dontScrollFlag;
    timer(600).subscribe(() => this.dontScrollFlag = false);
    if (index >= 0 && index < this.noOfBlocks) {
      const scrollTo = (document.querySelectorAll('.page-block')[index] as HTMLElement).offsetTop;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
  }

}
