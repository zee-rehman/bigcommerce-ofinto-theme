import 'jquery-zoom';
import _ from 'lodash';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage0 = $gallery.find('[data-image-gallery-main-0]');
        this.$mainImage = $gallery.find('[data-image-gallery-main]');
        this.$selectOption = $gallery.find('.slick-current[data-image-gallery-main]');
        this.$selectableImages = $gallery.find('.slick-current[data-image-gallery-main]');
        this.$swipThumbnails = $gallery.find('.productView-nav');
        this.$swipMainImages = $gallery.find('.productView-nav .slick-arrow');
        this.currentImage = {};
    }

    init() {
        this.bindEvents();
        this.setImageZoom();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);
        this.destroyImageZoom();
        this.setActiveThumb();
        this.swapMainImage0();
        this.setImageZoom();

    }

    setMainImage2(imgObj) {
        this.currentImage = _.clone(imgObj);
        this.destroyImageZoom();
        this.setActiveThumb();
        this.swapMainImage();
        this.setImageZoom2();

    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.attr('data-image-gallery-new-image-url'),
                zoomImageUrl: this.$mainImage.attr('data-zoom-image'),
                mainImageSrcset: this.$mainImage.attr('data-image-gallery-new-image-srcset'),
                $selectedThumb: this.currentImage.$selectedThumb
            };
        }
        this.$swipThumbnails.slick('slickGoTo', 0);
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        const $target = $(e.currentTarget).find('.slick-current[data-image-gallery-main]');
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-zoom-image'),
            mainImageSrcset: $target.attr('data-image-gallery-new-image-srcset'),
            $selectedThumb: $(e.currentTarget).find('.slick-current'),
        };
        this.setMainImage2(imgObj);
    }

    setActiveThumb() {
        this.$selectableImages.removeClass('is-active');
        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.addClass('is-active');
        }
    }

    swapMainImage() {
        this.$mainImage.attr({ 'data-zoom-image': this.currentImage.zoomImageUrl, })
            .attr({href: this.currentImage.mainImageUrl})
            .find('a').attr({href: this.currentImage.zoomImageUrl})
            .find('.productView-img-container img').attr({src: this.currentImage.mainImageUrl});
        this.$mainImage.find('.productView-img-container img').attr({srcset: this.currentImage.mainImageUrl});  
        this.$mainImage.find('img.zoomImg').attr({src: this.currentImage.zoomImageUrl})
                       .find('img.zoomImg').attr({srcset: this.currentImage.zoomImageUrl});
    }
    swapMainImage0() {
        this.$selectOption.attr({ 'data-zoom-image': this.currentImage.zoomImageUrl, })
            .attr({href: this.currentImage.mainImageUrl})
            .find('a').attr({href: this.currentImage.zoomImageUrl})
            .find('.productView-img-container img').attr({src: this.currentImage.mainImageUrl});
        this.$selectOption.find('.productView-img-container img').attr({srcset: this.currentImage.mainImageUrl});  
        this.$selectOption.find('img.zoomImg').attr({src: this.currentImage.zoomImageUrl})
                       .find('img.zoomImg').attr({srcset: this.currentImage.zoomImageUrl});
    }

    destroyImageZoom() {
        this.$mainImage.trigger('zoom.destroy');
    }

    setImageZoom() {
        if ($(window).width() > 1024) {
           this.$mainImage.zoom({ url: this.$mainImage.attr('data-zoom-image'), touch: false });
        }
    }
    setImageZoom2() {
        if ($(window).width() > 1024) {
           this.$mainImage.zoom();
        }
    }
    
    bindEvents() {
       this.$swipMainImages.on('click', this.selectNewImage.bind(this));
       this.$swipMainImages.on('afterChange', this.selectNewImage.bind(this));
    }

}
