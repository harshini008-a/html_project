import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ViewMenuComponent } from './viewmenu/viewmenu.component';
import { CartComponent } from './cart/cart.component';
import { AdminComponent } from './admin/admin.component';
import { BookTableComponent } from './booktable/booktable.component';
import { PaymentComponent } from './payment/payment.component';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';
import { UpdateMenuComponent } from './update-menu/update-menu.component';
import { PaySuccessComponent } from './pay-success/pay-success.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { OrderHistoryComponent } from './order-history/order-history.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'viewmenu', component: ViewMenuComponent },
  { path: 'cart', component: CartComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'booktable', component: BookTableComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'add-food-item', component: AddFoodItemComponent },
  { path: 'pay-success', component: PaySuccessComponent },
  { path: 'receipt', component: ReceiptComponent },
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'update-menu', component: UpdateMenuComponent }
];