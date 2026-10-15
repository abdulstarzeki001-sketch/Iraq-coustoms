window.App = window.App || {};

(function (App) {
  App.storage = {
    saveDoc(doc) {
      try {
        localStorage.setItem(App.constants.STORAGE_KEY, JSON.stringify(doc));
        App.sync?.push?.(App.constants.STORAGE_KEY, doc);
        return true;
      } catch (error) {
        console.error(error);
        App.utils?.showStatus?.("تعذر حفظ الوثيقة في المتصفح. تأكد من توفر مساحة التخزين أو السماح بالتخزين المحلي.", "error");
        return false;
      }
    },

    getDoc() {
      try {
        return Object.assign({}, App.constants.DEFAULTS, JSON.parse(localStorage.getItem(App.constants.STORAGE_KEY) || "{}"));
      } catch (error) {
        console.error(error);
        return Object.assign({}, App.constants.DEFAULTS);
      }
    },

    clearDoc() {
      try {
        localStorage.removeItem(App.constants.STORAGE_KEY);
      } catch (error) {
        console.error(error);
      }
    },

    hasDoc() {
      try {
        const raw = localStorage.getItem(App.constants.STORAGE_KEY);
        return Boolean(raw && raw !== "{}");
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    saveDraft(doc) {
      try {
        localStorage.setItem(App.constants.DRAFT_STORAGE_KEY, JSON.stringify(doc));
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    getDraft() {
      try {
        return JSON.parse(localStorage.getItem(App.constants.DRAFT_STORAGE_KEY) || "{}");
      } catch (error) {
        console.error(error);
        return {};
      }
    },

    hasDraft() {
      try {
        const raw = localStorage.getItem(App.constants.DRAFT_STORAGE_KEY);
        return Boolean(raw && raw !== "{}");
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    clearDraft() {
      try {
        localStorage.removeItem(App.constants.DRAFT_STORAGE_KEY);
      } catch (error) {
        console.error(error);
      }
    },

    saveSelectedCompany(company) {
      try {
        localStorage.setItem(App.constants.SELECTED_COMPANY_KEY, JSON.stringify(company || {}));
        return true;
      } catch (error) {
        console.error(error);
        App.utils?.showStatus?.("تعذر حفظ الشركة المختارة في المتصفح.", "error");
        return false;
      }
    },

    readSelectedCompany() {
      try {
        return JSON.parse(localStorage.getItem(App.constants.SELECTED_COMPANY_KEY) || "{}");
      } catch (error) {
        console.error(error);
        return {};
      }
    },

    clearSelectedCompany() {
      try {
        localStorage.removeItem(App.constants.SELECTED_COMPANY_KEY);
      } catch (error) {
        console.error(error);
      }
    },

    normalizeDriverEntry(driver) {
      if (!driver || typeof driver !== "object") return null;

      const driver_name = String(driver.driver_name ?? "").trim();
      const vehicle_number = String(driver.vehicle_number ?? "").trim();
      const registration_governorate = String(
        driver.registration_governorate ??
        (vehicle_number.includes("دهوك") ? "دهوك" : "")
      ).trim();
      if (!driver_name || !vehicle_number) return null;

      return {
        driver_name,
        vehicle_number,
        registration_governorate,
        created_at: String(driver.created_at ?? new Date().toISOString())
      };
    },

    getDrivers() {
      const normalizeKey = (entry) => {
        return [
          App.utils.normalizeSearchText(entry.driver_name),
          App.utils.normalizeSearchText(entry.vehicle_number),
          App.utils.normalizeSearchText(entry.registration_governorate)
        ].join("::");
      };

      const seeded = (App.constants.DEFAULT_DRIVERS || []).map((entry) => this.normalizeDriverEntry(entry)).filter(Boolean);
      let stored = [];
      try {
        const raw = JSON.parse(localStorage.getItem(App.constants.DRIVER_STORAGE_KEY) || "[]");
        if (Array.isArray(raw)) {
          stored = raw.map((entry) => this.normalizeDriverEntry(entry)).filter(Boolean);
        }
      } catch (error) {
        console.error(error);
      }

      const merged = [];
      const seen = new Set();

      stored.concat(seeded).forEach((entry) => {
        const key = normalizeKey(entry);
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(entry);
      });

      return merged.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    },

    saveDriver(driver) {
      const entry = this.normalizeDriverEntry(driver);
      if (!entry) return false;

      const all = this.getDrivers().filter((item) => {
        return !(
          App.utils.normalizeSearchText(item.driver_name) === App.utils.normalizeSearchText(entry.driver_name) &&
          App.utils.normalizeSearchText(item.vehicle_number) === App.utils.normalizeSearchText(entry.vehicle_number) &&
          App.utils.normalizeSearchText(item.registration_governorate) === App.utils.normalizeSearchText(entry.registration_governorate)
        );
      });

      all.unshift(entry);

      try {
        const toSave = all.slice(0, 200);
        localStorage.setItem(App.constants.DRIVER_STORAGE_KEY, JSON.stringify(toSave));
        App.sync?.push?.(App.constants.DRIVER_STORAGE_KEY, toSave);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    normalizeTraderName(name) {
      return String(name ?? "").trim();
    },

    getTraders() {
      try {
        const raw = JSON.parse(localStorage.getItem(App.constants.TRADERS_STORAGE_KEY) || "[]");
        if (!Array.isArray(raw)) return [];
        const unique = [];
        const seen = new Set();

        raw.forEach((entry) => {
          const name = this.normalizeTraderName(typeof entry === "string" ? entry : entry?.name);
          const normalized = App.utils.normalizeSearchText(name);
          if (!name || seen.has(normalized)) return;
          seen.add(normalized);
          unique.push({ name });
        });

        return unique.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      } catch (error) {
        console.error(error);
        return [];
      }
    },

    saveTrader(name) {
      const traderName = this.normalizeTraderName(name);
      if (!traderName) return false;

      const traders = this.getTraders().filter((entry) => {
        return App.utils.normalizeSearchText(entry.name) !== App.utils.normalizeSearchText(traderName);
      });

      traders.push({ name: traderName });

      try {
        localStorage.setItem(App.constants.TRADERS_STORAGE_KEY, JSON.stringify(traders));
        App.sync?.push?.(App.constants.TRADERS_STORAGE_KEY, traders);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    deleteTrader(name) {
      const traderName = this.normalizeTraderName(name);
      if (!traderName) return false;

      try {
        const traders = this.getTraders().filter((entry) => {
          return App.utils.normalizeSearchText(entry.name) !== App.utils.normalizeSearchText(traderName);
        });
        localStorage.setItem(App.constants.TRADERS_STORAGE_KEY, JSON.stringify(traders));
        App.sync?.push?.(App.constants.TRADERS_STORAGE_KEY, traders);

        const ledger = this.getTraderLedger().filter((entry) => {
          return App.utils.normalizeSearchText(entry.trader_name) !== App.utils.normalizeSearchText(traderName);
        });
        localStorage.setItem(App.constants.TRADER_LEDGER_KEY, JSON.stringify(ledger));
        App.sync?.push?.(App.constants.TRADER_LEDGER_KEY, ledger);

        const payments = this.getTraderPayments().filter((entry) => {
          return App.utils.normalizeSearchText(entry.trader_name) !== App.utils.normalizeSearchText(traderName);
        });
        localStorage.setItem(App.constants.TRADER_PAYMENT_KEY, JSON.stringify(payments));
        App.sync?.push?.(App.constants.TRADER_PAYMENT_KEY, payments);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    getTraderLedger() {
      try {
        const raw = JSON.parse(localStorage.getItem(App.constants.TRADER_LEDGER_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },

    saveTraderTransaction(entry) {
      const trader_name = this.normalizeTraderName(entry?.trader_name);
      const company_name_project = String(entry?.company_name_project ?? "").trim();
      const driver_name = String(entry?.driver_name ?? "").trim();
      const destination_governorate = String(entry?.destination_governorate ?? "").trim();
      const doc_id = String(entry?.doc_id ?? "").trim();
      const date_str = String(entry?.date_str ?? "").trim();
      const valueText = String(entry?.document_value_usd ?? "").trim();
      const value = Number(valueText);

      if (!trader_name || !company_name_project || !driver_name || !destination_governorate || !doc_id || !date_str || !Number.isFinite(value) || value <= 0) {
        return false;
      }

      this.saveTrader(trader_name);

      const ledger = this.getTraderLedger().filter((item) => {
        return !(String(item.doc_id ?? "").trim() === doc_id && App.utils.normalizeSearchText(item.trader_name) === App.utils.normalizeSearchText(trader_name));
      });

      ledger.unshift({
        trader_name,
        company_name_project,
        driver_name,
        destination_governorate,
        document_value_usd: value.toFixed(2),
        doc_id,
        date_str,
        created_at: new Date().toISOString(),
        entry_type: "document"
      });

      try {
        const toSave = ledger.slice(0, 5000);
        localStorage.setItem(App.constants.TRADER_LEDGER_KEY, JSON.stringify(toSave));
        App.sync?.push?.(App.constants.TRADER_LEDGER_KEY, toSave);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    getTraderPayments() {
      try {
        const raw = JSON.parse(localStorage.getItem(App.constants.TRADER_PAYMENT_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },

    saveTraderPayment(entry) {
      const trader_name = this.normalizeTraderName(entry?.trader_name);
      const payment_date = String(entry?.payment_date ?? "").trim();
      const payment_type = String(entry?.payment_type ?? "").trim();
      const notes = String(entry?.notes ?? "").trim();
      const reference_no = String(entry?.reference_no ?? "").trim();
      const amount = Number(entry?.amount);

      if (!trader_name || !payment_date || !Number.isFinite(amount) || amount <= 0) {
        return false;
      }

      const allowedTypes = new Set(["receipt", "settlement"]);
      const normalizedType = allowedTypes.has(payment_type) ? payment_type : "receipt";

      this.saveTrader(trader_name);

      const payments = this.getTraderPayments();
      payments.unshift({
        id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        trader_name,
        payment_date,
        payment_type: normalizedType,
        amount: amount.toFixed(2),
        notes,
        reference_no,
        created_at: new Date().toISOString()
      });

      try {
        const toSave = payments.slice(0, 5000);
        localStorage.setItem(App.constants.TRADER_PAYMENT_KEY, JSON.stringify(toSave));
        App.sync?.push?.(App.constants.TRADER_PAYMENT_KEY, toSave);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    deleteTraderPayment(id) {
      const paymentId = String(id ?? "").trim();
      if (!paymentId) return false;

      try {
        const payments = this.getTraderPayments().filter((entry) => String(entry.id ?? "") !== paymentId);
        localStorage.setItem(App.constants.TRADER_PAYMENT_KEY, JSON.stringify(payments));
        App.sync?.push?.(App.constants.TRADER_PAYMENT_KEY, payments);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  };
})(window.App);