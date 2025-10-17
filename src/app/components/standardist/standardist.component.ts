import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Standardist {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface SelectedItem {
  standardist: Standardist;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

@Component({
  selector: 'app-standardist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './standardist.component.html',
  styleUrls: ['./standardist.component.scss']
})
export class StandardistComponent implements OnInit {
  activeTab: string = 'products';
  selectedItems: SelectedItem[] = [];
  showInvoiceDialog = false;

  customerInfo: CustomerInfo = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  standardists: Standardist[] = [
    {
      id: '1',
      name: 'Test automatisé basique',
      description: 'Test automatisé simple pour applications web',
      price: 150,
      category: 'testing'
    },
    {
      id: '2',
      name: 'Test de performance',
      description: 'Analyse complète des performances',
      price: 300,
      category: 'testing'
    },
    {
      id: '3',
      name: 'Test de sécurité',
      description: 'Audit de sécurité approfondi',
      price: 450,
      category: 'security'
    },
    {
      id: '4',
      name: 'Test d\'intégration',
      description: 'Tests d\'intégration API et services',
      price: 250,
      category: 'testing'
    },
    {
      id: '5',
      name: 'Formation équipe',
      description: 'Formation complète de votre équipe',
      price: 500,
      category: 'training'
    },
    {
      id: '6',
      name: 'Support technique',
      description: 'Support technique mensuel',
      price: 200,
      category: 'support'
    }
  ];

  filteredStandardists: Standardist[] = [];
  selectedCategory = 'all';

  ngOnInit() {
    this.filterStandardists();
  }

  filterStandardists() {
    if (this.selectedCategory === 'all') {
      this.filteredStandardists = this.standardists;
    } else {
      this.filteredStandardists = this.standardists.filter(
        s => s.category === this.selectedCategory
      );
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'finalization') {
      this.showFinalizationTab();
    }
  }

  addToSelection(standardist: Standardist) {
    const existing = this.selectedItems.find(item => item.standardist.id === standardist.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.selectedItems.push({
        standardist: standardist,
        quantity: 1
      });
    }
  }

  removeFromSelection(standardistId: string) {
    this.selectedItems = this.selectedItems.filter(
      item => item.standardist.id !== standardistId
    );
  }

  updateQuantity(standardistId: string, quantity: number) {
    const item = this.selectedItems.find(item => item.standardist.id === standardistId);
    if (item && quantity > 0) {
      item.quantity = quantity;
    } else if (item && quantity <= 0) {
      this.removeFromSelection(standardistId);
    }
  }

  getTotalPrice(): number {
    return this.selectedItems.reduce(
      (total, item) => total + (item.standardist.price * item.quantity),
      0
    );
  }

  showFinalizationTab() {
    if (this.selectedItems.length === 0) {
      alert('Veuillez sélectionner au moins un service avant de finaliser.');
      this.activeTab = 'products';
      return;
    }
  }

  openInvoiceDialog() {
    if (!this.customerInfo.name || !this.customerInfo.email) {
      alert('Veuillez remplir les informations client obligatoires.');
      return;
    }
    this.showInvoiceDialog = true;
  }

  closeInvoiceDialog() {
    this.showInvoiceDialog = false;
  }

  confirmPurchase() {
    console.log('Purchase confirmed:', {
      customer: this.customerInfo,
      items: this.selectedItems,
      total: this.getTotalPrice()
    });

    alert('Commande confirmée! Vous recevrez une confirmation par email.');

    // Reset form
    this.selectedItems = [];
    this.customerInfo = {
      name: '',
      email: '',
      phone: '',
      address: ''
    };
    this.activeTab = 'products';
    this.closeInvoiceDialog();
  }

  getSelectedItemsCount(): number {
    return this.selectedItems.reduce((total, item) => total + item.quantity, 0);
  }

  trackByStandardistId(index: number, standardist: Standardist): string {
    return standardist.id;
  }

  trackBySelectedItemId(index: number, item: SelectedItem): string {
    return item.standardist.id;
  }
}