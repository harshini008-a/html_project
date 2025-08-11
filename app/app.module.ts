import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ViewMenuComponent } from './viewmenu/viewmenu.component';
import { CartComponent } from './cart/cart.component';
import { AdminComponent } from './admin/admin.component';
import { BookTableComponent } from './booktable/booktable.component';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';
import { UpdateMenuComponent } from './update-menu/update-menu.component';
import { PaymentComponent } from './payment/payment.component';
import { PaySuccessComponent } from './pay-success/pay-success.component';
import { ReceiptComponent } from './receipt/receipt.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ViewMenuComponent,
    CartComponent,
    AdminComponent,
    BookTableComponent,
    AddFoodItemComponent,
    UpdateMenuComponent,
    PaymentComponent,
    PaySuccessComponent,
    ReceiptComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }