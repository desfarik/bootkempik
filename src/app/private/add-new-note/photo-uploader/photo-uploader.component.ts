import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input, OnChanges,
    OnDestroy,
    OnInit, SecurityContext, SimpleChanges,
    ViewChild
} from '@angular/core';
import {NgxViewerjsDirective} from 'ngx-viewerjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

const NEED_RESIZE_IMAGE_SIZE = 1024 * 1000;
const MAX_IMAGE_SIZE = 1024 * 2000;

@Component({
    selector: 'app-photo-uploader',
    templateUrl: './photo-uploader.component.html',
    styleUrls: ['./photo-uploader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploaderComponent implements OnInit, OnDestroy, OnChanges {

    constructor(private changeDetection: ChangeDetectorRef,
                private sanitizer: DomSanitizer) {
    }

    @Input()
    initialUrl: string;
    private localInitialUrl: string;

    photoUrl: SafeResourceUrl;
    @Input()
    readonly = false;

    loading = false;
    viewMode = false;
    rotateDeg = 0;

    @ViewChild('photo', {static: false})
    photoElement: ElementRef<HTMLImageElement>;

    @ViewChild('photoInput', {static: true})
    photoInput: ElementRef<HTMLInputElement>;

    @ViewChild('canvasElement', {static: true})
    canvasElement: ElementRef<HTMLCanvasElement>;

    @ViewChild(NgxViewerjsDirective)
    imageViewer: NgxViewerjsDirective;

    public get viewerOptions(): Viewer.Options {
        const component = this;
        return {
            navbar: false,
            toolbar: false,
            button: false,
            tooltip: false,
            transition: true,
            view(event: CustomEvent) {
                while (Math.abs(component.rotateDeg) >= 360) {
                    component.rotateDeg = component.rotateDeg - (360 * Math.sign(component.rotateDeg));
                }
                if (component.rotateDeg < 0) {
                    component.rotateDeg = 360 + component.rotateDeg;
                }
                event.detail.image.classList.add(component.rotateClass);
            }
        };
    }

    private get viewerImage(): HTMLImageElement {
        // @ts-ignore
        return this.imageViewer.instance.image;
    }

    private get rotateClass(): string {
        return `rotate-${this.rotateDeg}`;
    }

    ngOnInit(): void {
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes?.initialUrl?.currentValue) {
            this.loading = true;
            try {
                const response = await fetch(this.initialUrl);
                const photo = await response.blob();
                this.localInitialUrl = URL.createObjectURL(photo);
                this.photoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.localInitialUrl);
            } finally {
                this.loading = false;
                this.changeDetection.detectChanges();
            }
        }
    }

    onPhotoUploaderClick() {
        if (this.readonly || this.photoUrl) {
            this.changeDetection.detectChanges();
            return;
        }
        this.photoInput.nativeElement.click();
    }

    onImageViewerViewed() {
        this.imageViewer.instance.rotateTo(this.rotateDeg);
        this.viewerImage.classList.remove(this.rotateClass);
    }

    async exitFromViewMode() {
        this.viewMode = false;
        this.imageViewer.instance.hide();
        this.changeDetection.detectChanges();
    }

    async onSelectPhoto(event) {
        if (!(event.target.files[0] instanceof Blob)) {
            return;
        }
        this.loading = true;
        this.changeDetection.detectChanges();

        let photo = event.target.files[0];
        if (photo.size > NEED_RESIZE_IMAGE_SIZE) {
            photo = await this.resizeImage(photo, Number((NEED_RESIZE_IMAGE_SIZE / photo.size).toFixed(1)));

            if (!photo || photo.size > MAX_IMAGE_SIZE) {
                return;
            }
        }
        this.photoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(photo));
        this.changeDetection.detectChanges();
        this.photoElement.nativeElement.onload = () => {
            this.loading = false;
            if (this.viewMode) {
                this.rotateDeg = 0;
                this.imageViewer.instance.update();
            }
            this.changeDetection.detectChanges();
        };
    }

    rotateImage(deg: number) {
        this.imageViewer.instance.rotate(deg);
        this.rotateDeg += deg;
    }

    deleteImage() {
        this.photoUrl = null;
        this.exitFromViewMode();
    }

    private needChangeOrientation(): boolean {
        return this.rotateDeg % 180 !== 0;
    }

    getImageBase64(): Promise<string> {
        const safeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.photoUrl);
        if (safeUrl === this.localInitialUrl && Math.abs(this.rotateDeg) % 360 === 0) {
            return Promise.resolve(null);
        }
        return new Promise(resolve => {
            const canvas = this.canvasElement.nativeElement;
            const context = canvas.getContext('2d');
            context.setTransform(1, 0, 0, 1, 0, 0);

            const img = new Image();
            img.onload = () => {
                if (this.needChangeOrientation()) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (this.needChangeOrientation()) {
                    context.translate(img.height / 2, img.width / 2);
                } else {
                    context.translate(img.width / 2, img.height / 2);
                }
                context.rotate(this.rotateDeg * Math.PI / 180);
                context.drawImage(img, -img.width / 2, -img.height / 2);
                resolve(canvas.toDataURL('image/jpeg', 1));
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = safeUrl;
        });
    }

    private resizeImage(imageFile: Blob, quality: number): Promise<Blob> {
        return new Promise(resolve => {
            const context = this.canvasElement.nativeElement.getContext('2d');
            const img = new Image();
            img.onload = () => {
                this.canvasElement.nativeElement.width = img.width;
                this.canvasElement.nativeElement.height = img.height;
                this.changeDetection.detectChanges();
                context.drawImage(img, 0, 0);
                this.canvasElement.nativeElement.toBlob((blob) => resolve(blob), 'image/jpeg', Math.max(0.25, quality));
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = URL.createObjectURL(imageFile);
        });
    }

    ngOnDestroy(): void {
        this.imageViewer?.instance?.destroy();
    }
}
