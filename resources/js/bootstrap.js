/**
 * A rugged, minimal framework for composing JavaScript behavior in your markup.
 */
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'
/**
 * LazySizes is an SEO-friendly and self-initializing lazyloader for images
 * iframes, scripts/widgets and much more. It prioritizes resources  by
 * differentiating between crucial in view and near view elements to make
 * perceived performance even faster.
 */
import 'lazysizes'

window.Alpine = Alpine
Alpine.plugin(collapse)
Alpine.plugin(intersect)
Alpine.plugin(persist)
Alpine.start()
