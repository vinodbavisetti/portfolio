import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { exhaustMap, Subject, take, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  lastScrollPosition: number;
  noOfBlocks = 0;
  noScrollFlag = false;

  scrollHandlerObservable = new Subject<null>();

  @HostListener('document:scroll', ['$event'])
  onScroll(e: MouseEvent) {
    e.preventDefault();
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
    this.scrollHandlerObservable.pipe(
      exhaustMap(() => {
        return timer(0, 1000).pipe(take(2));
      }),
    ).subscribe({
      next: (value) => {
        const scrollPosition = document.documentElement.scrollTop;
        if (this.lastScrollPosition === scrollPosition) {
          return;
        }
        const scrollIndex = ~~(scrollPosition / innerHeight);
        if (value === 0) {
          const scrollDirection = this.lastScrollPosition > scrollPosition ? 'up' : 'down';
          if (scrollDirection === 'down') {
            this.goToThatBlock(scrollIndex + 1);
          } else {
            this.goToThatBlock(scrollIndex);
          }    
        } else if(value === 1) {
          const remainder = scrollPosition % innerHeight;
          if (remainder >= (innerHeight / 2)) {
            this.goToThatBlock(scrollIndex + 1);
            // window.scrollBy({
            //   top: innerHeight - remainder,
            //   behavior: 'smooth',
            // })
          } else {
            this.goToThatBlock(scrollIndex);
            // window.scrollBy({
            //   top: -remainder,
            //   behavior: 'smooth',
            // })
          }
        }
        this.lastScrollPosition = scrollPosition;
      }
    })
  }

  goToThatBlock(index: number) {
    if (index >= 0 && index < this.noOfBlocks) {
      if (this.noScrollFlag) { return; }
      console.log(index)
      const scrollTo = (document.querySelectorAll('.page-block')[index] as HTMLElement).offsetTop;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      this.noScrollFlag = true;
      timer(500).subscribe(() => { this.noScrollFlag = false; })
    }
  }

}
