import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that transforms raw seconds to mm:ss format.
 */
@Pipe({
	name: 'toMMSS'
})
export class ToMMSSPipe implements PipeTransform {
	/**
	 * Transforms raw seconds value into mm:ss string format
	 * @param sec_num
	 * @returns transform
	 */
	transform(sec_num: number): string {
		const hours = Math.floor(sec_num / 3600);
		const minutes = Math.floor((sec_num - hours * 3600) / 60);
		const seconds = sec_num - hours * 3600 - minutes * 60;
		let min = minutes.toString();
		let sec = seconds.toString();

		if (minutes < 10) {
			min = '0' + minutes.toString();
		}
		if (seconds < 10) {
			sec = '0' + seconds.toString();
		}
		return min + ':' + sec;
	}
}
