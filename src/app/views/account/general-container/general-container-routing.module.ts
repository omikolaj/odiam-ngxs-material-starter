import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralContainerComponent } from './general-container.component';

const routes: Routes = [
	{
		path: '',
		component: GeneralContainerComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class GeneralContainerRoutingModule {}
