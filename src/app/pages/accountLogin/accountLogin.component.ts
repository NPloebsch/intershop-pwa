import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountLoginService } from './accountLoginService/accountLogin.service';
import { EmailValidator } from '../../shared/validators/email.validator';


@Component({
  templateUrl: './accountLogin.component.html'
})

export class AccountLoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;

  /**
   * Constructor
   * @param  {FormBuilder} privateformBuilder
   * @param  {AccountLoginService} privateaccountLoginService
   * @param  {Router} privaterouter
   * @param  {ActivatedRoute} privateroute
   */
  constructor(private formBuilder: FormBuilder, private accountLoginService: AccountLoginService,
    private router: Router, private route: ActivatedRoute) { }

  /**
   * Routes to Family Page when user is logged in
   */
  onSignin() {
    this.accountLoginService.singinUser(this.loginForm.value).subscribe(userData => {
      if (userData) {
        this.router.navigate(['familyPage']);
      } else {
        alert('Invalid Username or Password');
      }
    });
  }

  /**
   * Routes to Register Page
   */
  registerUser() {
    this.router.navigate(['register']);
  }

  /**
   * Creates Login Form
   */
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required, EmailValidator.validate]],
      password: ['', Validators.required],
    });

    /*
      reset login status
    */
    this.accountLoginService.logout();

    /*
      get return url from route parameters or default to '/'
    */
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }
}
