import { Component, model, ChangeDetectionStrategy } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside',
  imports: [ButtonDirective, ButtonLabel, ButtonIcon, RouterLink, RouterLinkActive],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css',
  host: {
    class:
      'bg-white dark:bg-surface-900 flex-shrink-0 shadow transition-transform max-lg:fixed top-0 left-0 max-lg:h-screen max-lg:z-30',
    '[class.max-lg:-translate-x-full]': '!opened()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideComponent {
  opened = model(false);

  linkGroups = [
    {
      title: 'Главная',
      links: [
        {
          icon: 'pi pi-home',
          label: 'Панель управления',
          link: '/core/dashboard',
        },
      ],
    },
    {
      title: 'Документы',
      links: [
        {
          icon: 'pi pi-shopping-cart',
          label: 'Продажи',
          link: '/core/document-sells',
        },
        {
          icon: 'pi pi-shopping-bag',
          label: 'Покупки',
          link: '/core/document-purchases',
        },
      ],
    },
    {
      title: 'Контрагенты',
      links: [
        {
          icon: 'pi pi-building',
          label: 'Поставщики',
          link: '/core/vendors',
        },
        {
          icon: 'pi pi-users',
          label: 'Клиенты',
          link: '/core/customers',
        },
      ],
    },
    {
      title: 'Справочники',
      links: [
        {
          icon: 'pi pi-shopping-bag',
          label: 'Магазины',
          link: '/core/stores',
        },
        {
          icon: 'pi pi-credit-card',
          label: 'Кассы',
          link: '/core/cashboxes',
        },
        {
          icon: 'pi pi-shopping-cart',
          label: 'Товары',
          link: '/core/products',
        },
        {
          icon: 'pi pi-tags',
          label: 'Категории',
          link: '/core/categories',
        },
        {
          icon: 'pi pi-dollar',
          label: 'Прайс-листы',
          link: '/core/price-types',
        },
        {
          icon: 'pi pi-money-bill',
          label: 'Валюты',
          link: '/core/currencies',
        },
      ],
    },
  ];
}
