(function() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('subscriptionModal');
    const closeModal = document.getElementById('closeModal');
    const backToPlans = document.getElementById('backToPlans');
    const closeSuccess = document.getElementById('closeSuccess');
    const paymentButtons = document.querySelectorAll('.btn-payment');
    const paymentForm = document.getElementById('paymentForm');
    const cardForm = document.getElementById('cardForm');
    const subscriptionPlans = document.querySelector('.subscription-plans');
    const successMessage = document.getElementById('successMessage');
    const successMessage2 = document.getElementById('successMessage');
    const totalPriceEl = document.getElementById('totalPrice');
    const planNameEl = document.getElementById('planName');
    let selectedPlan = null;
    let selectedPrice = null;
    let selectedPlanName = null;
    subscribeBtn?.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    closeModal?.addEventListener('click', closeModalHandler);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
    function closeModalHandler() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetModal();
    }
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedPlan = button.getAttribute('data-plan');
            selectedPrice = button.getAttribute('data-price');
            selectedPlanName = button.closest('.plan').querySelector('h3').textContent;
            subscriptionPlans.style.display = 'none';
            paymentForm.classList.remove('hidden');
            const priceFormatted = parseFloat(selectedPrice).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            totalPriceEl.textContent = priceFormatted + ' €';
            planNameEl.textContent = 'Plan: ' + selectedPlanName;
        });
    });
    backToPlans?.addEventListener('click', () => {
        subscriptionPlans.style.display = 'grid';
        paymentForm.classList.add('hidden');
        cardForm.reset();
    });
    cardForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const cardholderName = document.getElementById('cardholderName').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const email = document.getElementById('email').value;
        if (!validateCardNumber(cardNumber)) {
            showError('Numéro de carte invalide');
            return;
        }

        if (!validateExpiryDate(expiryDate)) {
            showError('Date d\'expiration invalide (MM/YY)');
            return;
        }

        if (!validateCVV(cvv)) {
            showError('CVV invalide');
            return;
        }
        processPayment(cardholderName, cardNumber, expiryDate, cvv, email);
    });
    document.getElementById('cardNumber')?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += ' ';
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
    });
    document.getElementById('expiryDate')?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    document.getElementById('cvv')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    function validateCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        return /^\d{16}$/.test(cleanNumber);
    }

    function validateExpiryDate(date) {
        return /^\d{2}\/\d{2}$/.test(date);
    }

    function validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }
    function processPayment(name, cardNumber, expiry, cvv, email) {
        const submitBtn = cardForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Traitement...';
        submitBtn.disabled = true;
        setTimeout(() => {
            paymentForm.classList.add('hidden');
            successMessage.classList.remove('hidden');
            console.log('Paiement réussi:', {
                plan: selectedPlan,
                planName: selectedPlanName,
                amount: selectedPrice,
                cardholderName: name,
                email: email,
                timestamp: new Date().toISOString()
            });
            const subscription = {
                plan: selectedPlan,
                planName: selectedPlanName,
                amount: selectedPrice,
                email: email,
                subscribedAt: new Date().toISOString(),
                status: 'active'
            };
            localStorage.setItem('groupie_subscription', JSON.stringify(subscription));
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    closeSuccess?.addEventListener('click', closeModalHandler);
    function showError(message) {
        alert(message);
    }
    function resetModal() {
        subscriptionPlans.style.display = 'grid';
        paymentForm.classList.add('hidden');
        successMessage.classList.add('hidden');
        cardForm.reset();
        selectedPlan = null;
        selectedPrice = null;
        selectedPlanName = null;
    }
    function checkSubscriptionStatus() {
        const subscription = localStorage.getItem('groupie_subscription');
        if (subscription) {
            const data = JSON.parse(subscription);
            console.log('Utilisateur abonné:', data);
        }
    }
    document.addEventListener('DOMContentLoaded', checkSubscriptionStatus);
})();
