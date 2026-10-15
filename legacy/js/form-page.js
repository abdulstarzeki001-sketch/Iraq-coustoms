window.App = window.App || {};

(function (App) {
  App.formPage = {
    requiredFields: [
      { name: "doc_id", label: "رقم الوثيقة" },
      { name: "date_str", label: "تاريخ إنشاء الوثيقة" },
      { name: "company_name_project", label: "اسم الشركة / المشروع" },
      { name: "license_approval_number", label: "رقم الإجازة / الموافقة" },
      { name: "driver_name", label: "اسم السائق" },
      { name: "vehicle_number", label: "رقم العجلة" },
      { name: "destination_governorate", label: "الوجهة النهائية / المحافظة" },
      { name: "trader_name", label: "اسم التاجر" },
      { name: "document_value_usd", label: "قيمة الوثيقة بالدولار" }
    ],

    optionalWarningFields: [
      { name: "checkpoint_name_control", label: "اسم سيطرة الدخول" },
      { name: "registration_governorate", label: "محافظة تسجيل العجلة" },
      { name: "cargo_typedetails", label: "نوع / تفاصيل الحمولة" },
      { name: "weight_quantity", label: "الوزن / الكمية" }
    ],

    numericRuleMap: {
      doc_id: {
        label: "رقم الوثيقة",
        allow: /^[0-9٠-٩]+$/,
        hint: "يجب أن يحتوي رقم الوثيقة على أرقام فقط"
      },
      vehicle_number: {
        label: "رقم العجلة",
        allow: /^[0-9٠-٩\s\-\/]+$/,
        hint: "رقم العجلة يجب أن يحتوي على أرقام فقط مع السماح بشرطة أو شرطة مائلة"
      },
      weight_quantity: {
        label: "الوزن / الكمية",
        allow: /^[0-9٠-٩]+([.,٫][0-9٠-٩]+)?$/,
        hint: "الوزن / الكمية يجب أن يكون رقمًا صحيحًا أو عشريًا"
      },
      production_capacity: {
        label: "الطاقة / الكمية",
        allow: /^[0-9٠-٩]+([.,٫][0-9٠-٩]+)?$/,
        hint: "الطاقة / الكمية يجب أن تكون رقمًا صحيحًا أو عشريًا"
      },
      document_value_usd: {
        label: "قيمة الوثيقة بالدولار",
        allow: /^[0-9٠-٩]+([.,٫][0-9٠-٩]+)?$/,
        hint: "قيمة الوثيقة يجب أن تكون رقمًا صحيحًا أو عشريًا"
      }
    },

    dateRuleMap: {},

    async getQrUploadBase64() {
      const input = App.dom.byId("qr_file");
      if (!input || !input.files || !input.files[0]) return "";

      return await new Promise(function (resolve) {
        const reader = new FileReader();
        reader.onload = function (event) {
          resolve(event.target?.result || "");
        };
        reader.onerror = function () {
          resolve("");
        };
        reader.readAsDataURL(input.files[0]);
      });
    },

    markFieldState(name, hasError) {
      const field = App.dom.getFormField(name);
      if (!field) return;
      field.classList.toggle("field-error", Boolean(hasError));
      field.setAttribute("aria-invalid", hasError ? "true" : "false");
    },

    clearFieldErrors() {
      this.requiredFields.concat(this.optionalWarningFields).forEach((field) => {
        this.markFieldState(field.name, false);
      });

      Object.keys(this.numericRuleMap).forEach((name) => this.markFieldState(name, false));
      Object.keys(this.dateRuleMap).forEach((name) => this.markFieldState(name, false));
      this.markQrFileState(false);
    },

    markQrFileState(hasError) {
      const field = App.dom.byId("qr_file");
      if (!field) return;
      field.classList.toggle("field-error", Boolean(hasError));
      field.setAttribute("aria-invalid", hasError ? "true" : "false");
    },

    hasQrFileSelected() {
      const input = App.dom.byId("qr_file");
      return Boolean(input && input.files && input.files[0]);
    },

    getMissingFields(fields) {
      return fields.filter((field) => !App.dom.getFormValue(field.name).trim());
    },

    normalizeDigits(value) {
      return String(value ?? "").replace(/[٠-٩]/g, function (digit) {
        return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit));
      });
    },

    normalizeDecimalValue(value) {
      return this.normalizeDigits(value).replace(/٫/g, ".").replace(/,/g, ".").trim();
    },

    normalizeDateForInput(value) {
      return App.utils.normalizeDateValue(value);
    },

    normalizeTimeForInput(value) {
      const text = String(value ?? "").trim();
      if (!text) return "";

      const normalized = this.normalizeDigits(text);

      if (/^\d{2}:\d{2}$/.test(normalized)) return normalized;
      if (/^\d{1,2}:\d{2}$/.test(normalized)) {
        const [hours, minutes] = normalized.split(":");
        return `${String(parseInt(hours, 10)).padStart(2, "0")}:${minutes}`;
      }

      const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(ص|م|AM|PM)$/i);
      if (!match) return "";

      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toLowerCase();

      const isPm = period === "م" || period === "pm";
      const isAm = period === "ص" || period === "am";

      if (isPm && hours < 12) hours += 12;
      if (isAm && hours === 12) hours = 0;

      return `${String(hours).padStart(2, "0")}:${minutes}`;
    },


    formatIsoDateTyping(value) {
      const digits = this.normalizeDigits(String(value ?? "")).replace(/\D/g, "");
      if (digits.length <= 4) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    },

    isValidDateValue(value) {
      const text = String(value ?? "").trim();
      if (!text) return false;

      const normalized = this.normalizeDigits(text);
      let year = "";
      let month = "";
      let day = "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        [year, month, day] = normalized.split("-");
      } else {
        const match = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (!match) return false;
        day = match[1].padStart(2, "0");
        month = match[2].padStart(2, "0");
        year = match[3];
      }

      const iso = `${year}-${month}-${day}`;
      const date = new Date(`${iso}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
    },

    getInvalidNumericFields() {
      return Object.entries(this.numericRuleMap).flatMap(([name, rule]) => {
        const raw = App.dom.getFormValue(name).trim();
        if (!raw) return [];
        return rule.allow.test(raw) ? [] : [{ name, label: rule.label, hint: rule.hint }];
      });
    },

    getInvalidDateFields() {
      return Object.entries(this.dateRuleMap).flatMap(([name, rule]) => {
        const raw = App.dom.getFormValue(name).trim();
        if (!raw) return rule.required ? [{ name, label: rule.label, hint: `${rule.label}: صيغة التاريخ غير صحيحة، المطلوب: YYYY-MM-DD` }] : [];
        return this.isValidDateValue(raw) ? [] : [{ name, label: rule.label, hint: `${rule.label}: صيغة التاريخ غير صحيحة، المطلوب: YYYY-MM-DD` }];
      });
    },

    validateBeforeSubmit() {
      this.clearFieldErrors();

      const missingRequired = this.getMissingFields(this.requiredFields);
      missingRequired.forEach((field) => this.markFieldState(field.name, true));

      if (missingRequired.length) {
        const first = App.dom.getFormField(missingRequired[0].name);
        if (first) first.focus();

        App.utils.showStatus(
          `يرجى إكمال الحقول المطلوبة: ${missingRequired.map((field) => field.label).join("، ")}`,
          "error"
        );
        return false;
      }

      const invalidNumeric = this.getInvalidNumericFields();
      invalidNumeric.forEach((field) => this.markFieldState(field.name, true));

      if (invalidNumeric.length) {
        const first = App.dom.getFormField(invalidNumeric[0].name);
        if (first) first.focus();

        App.utils.showStatus(
          invalidNumeric.map((field) => field.hint).join("، "),
          "error"
        );
        return false;
      }

      const invalidDates = this.getInvalidDateFields();
      invalidDates.forEach((field) => this.markFieldState(field.name, true));

      if (invalidDates.length) {
        const first = App.dom.getFormField(invalidDates[0].name);
        if (first) first.focus();

        App.utils.showStatus(
          invalidDates.map((field) => field.hint).join("، "),
          "error"
        );
        return false;
      }


      if (!this.hasQrFileSelected()) {
        this.markQrFileState(true);
        const qrFile = App.dom.byId("qr_file");
        if (qrFile) qrFile.focus();

        App.utils.showStatus("يرجى رفع صورة QR قبل إنشاء الوثيقة", "error");
        return false;
      }

            const missingOptional = this.getMissingFields(this.optionalWarningFields);
      if (missingOptional.length) {
        const proceed = window.confirm(
          `بعض الحقول المهمة ما زالت فارغة:\n- ${missingOptional.map((field) => field.label).join("\n- ")}\n\nهل تريد المتابعة رغم ذلك؟`
        );
        if (!proceed) {
          const first = App.dom.getFormField(missingOptional[0].name);
          if (first) first.focus();
          App.utils.showStatus("تم إيقاف الإرسال حتى تكمل البيانات الناقصة أو تؤكد المتابعة", "info");
          return false;
        }
      }

      return true;
    },

    buildDocObject() {
      const itemName = App.dom.getFormValue("item_name");
      const productionCapacity = App.dom.getFormValue("production_capacity");
      const unit = App.dom.getFormValue("unit");
      const items = [];

      if (itemName || productionCapacity || unit) {
        items.push({
          item_name: itemName,
          production_capacity: productionCapacity,
          unit: unit
        });
      }

      return {
        doc_id: App.dom.getFormValue("doc_id"),
        date_str: App.utils.normalizeDateValue(App.dom.getFormValue("date_str")) || App.dom.getFormValue("date_str"),
        current_date: App.utils.normalizeDateValue(App.dom.getFormValue("date_str")) || App.dom.getFormValue("date_str"),
        time_str: App.utils.formatTimeForDocument(App.dom.getFormValue("time_str")) || App.dom.getFormValue("time_str"),
        subject: App.dom.getFormValue("subject"),
        checkpoint_name_control: App.dom.getFormValue("checkpoint_name_control"),
        driver_name: App.dom.getFormValue("driver_name"),
        vehicle_number: App.dom.getFormValue("vehicle_number"),
        registration_governorate: App.dom.getFormValue("registration_governorate"),
        cargo_typedetails: App.dom.getFormValue("cargo_typedetails"),
        weight_quantity: App.dom.getFormValue("weight_quantity"),
        destination_governorate: App.dom.getFormValue("destination_governorate"),
        governorate_name: App.dom.getFormValue("governorate_name"),
        company_name_project: App.dom.getFormValue("company_name_project"),
        company_name: App.dom.getFormValue("company_name_project"),
        granting_license_approval: App.dom.getFormValue("granting_license_approval"),
        license_approval_number: App.dom.getFormValue("license_approval_number"),
        license_approval_date: App.utils.normalizeDateValue(App.dom.getFormValue("license_approval_date")) || App.dom.getFormValue("license_approval_date"),
        license_text_specialization: App.dom.getFormValue("license_text_specialization"),
        brand: App.dom.getFormValue("brand"),
        trader_name: App.dom.getFormValue("trader_name"),
        document_value_usd: this.normalizeDecimalValue(App.dom.getFormValue("document_value_usd")),
        qr_code: App.dom.getFormValue("qr_code"),
        qr_image_data: App.dom.getFormValue("qr_image_data"),
        items: items
      };
    },


    buildDraftObject() {
      const itemName = App.dom.getFormValue("item_name");
      const productionCapacity = App.dom.getFormValue("production_capacity");
      const unit = App.dom.getFormValue("unit");

      return {
        doc_id: App.dom.getFormValue("doc_id"),
        time_str: this.normalizeTimeForInput(App.dom.getFormValue("time_str")) || App.dom.getFormValue("time_str"),
        date_str: this.normalizeDateForInput(App.dom.getFormValue("date_str")),
        qr_code: App.dom.getFormValue("qr_code"),
        subject: App.dom.getFormValue("subject"),
        checkpoint_name_control: App.dom.getFormValue("checkpoint_name_control"),
        driver_name: App.dom.getFormValue("driver_name"),
        vehicle_number: App.dom.getFormValue("vehicle_number"),
        registration_governorate: App.dom.getFormValue("registration_governorate"),
        cargo_typedetails: App.dom.getFormValue("cargo_typedetails"),
        weight_quantity: App.dom.getFormValue("weight_quantity"),
        destination_governorate: App.dom.getFormValue("destination_governorate"),
        governorate_name: App.dom.getFormValue("governorate_name"),
        company_name_project: App.dom.getFormValue("company_name_project"),
        granting_license_approval: App.dom.getFormValue("granting_license_approval"),
        license_approval_number: App.dom.getFormValue("license_approval_number"),
        license_approval_date: this.normalizeDateForInput(App.dom.getFormValue("license_approval_date")),
        license_text_specialization: App.dom.getFormValue("license_text_specialization"),
        brand: App.dom.getFormValue("brand"),
        trader_name: App.dom.getFormValue("trader_name"),
        document_value_usd: App.dom.getFormValue("document_value_usd"),
        item_name: itemName,
        production_capacity: productionCapacity,
        unit: unit,
        company_search: App.dom.byId("companySearch")?.value || "",
        saved_at: new Date().toISOString()
      };
    },

    applyDraftToForm(draft) {
      if (!draft || typeof draft !== "object") return false;

      const fieldNames = [
        "doc_id",
        "time_str",
        "date_str",
        "qr_code",
        "subject",
        "checkpoint_name_control",
        "driver_name",
        "vehicle_number",
        "registration_governorate",
        "cargo_typedetails",
        "weight_quantity",
        "destination_governorate",
        "governorate_name",
        "company_name_project",
        "granting_license_approval",
        "license_approval_number",
        "license_approval_date",
        "license_text_specialization",
        "brand",
        "trader_name",
        "document_value_usd",
        "item_name",
        "production_capacity",
        "unit"
      ];

      let applied = false;
      fieldNames.forEach((name) => {
        if (!Object.prototype.hasOwnProperty.call(draft, name)) return;
        const field = App.dom.getFormField(name);
        if (!field) return;

        let value = draft[name] ?? "";
        if (name === "date_str" || name === "license_approval_date") {
          value = this.normalizeDateForInput(value);
        }
        if (name === "time_str") {
          value = this.normalizeTimeForInput(value);
        }

        field.value = value;
        applied = true;
      });

      const search = App.dom.byId("companySearch");
      if (search && draft.company_search) {
        search.value = draft.company_search;
      }

      return applied;
    },

    restoreDraft() {
      if (!App.storage.hasDraft()) return;

      const draft = App.storage.getDraft();
      if (!draft || typeof draft !== "object") return;

      const hasUsefulData = [
        draft.driver_name,
        draft.vehicle_number,
        draft.company_name_project,
        draft.license_approval_number,
        draft.destination_governorate,
        draft.company_search
      ].some((value) => String(value || "").trim());

      if (!hasUsefulData) return;

      const shouldRestore = window.confirm("تم العثور على مسودة محفوظة تلقائيًا. هل تريد استرجاعها؟");
      if (!shouldRestore) return;

      const restored = this.applyDraftToForm(draft);
      if (!restored) return;

      if (draft.company_name_project) {
        App.storage.saveSelectedCompany({
          Number: "",
          CompanyNameProject: draft.company_name_project,
          GovernorateName: draft.governorate_name || "",
          GrantingLicenseApproval: draft.granting_license_approval || "",
          LicenseApprovalNumber: draft.license_approval_number || "",
          LicenseApprovalDate: draft.license_approval_date || "",
          LicenseTextSpecialization: draft.license_text_specialization || "",
          Brand: draft.brand || "",
          CargoDetails: draft.cargo_typedetails || "",
          TypeIndustryProduction: draft.item_name || "",
          Unit: draft.unit || ""
        });
      }

      App.utils.showStatus("تم استرجاع آخر مسودة محفوظة تلقائيًا. إذا كانت الوثيقة تحتاج QR، أعد رفع صورة QR لأن ملفات الرفع لا تُسترجع من المسودة", "success");
    },

    scheduleAutoSave() {
      window.clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = window.setTimeout(() => {
        const draft = this.buildDraftObject();
        const hasAnyValue = Object.entries(draft).some(([key, value]) => {
          if (key === "saved_at") return false;
          return String(value ?? "").trim();
        });

        if (!hasAnyValue) {
          App.storage.clearDraft();
          return;
        }

        App.storage.saveDraft(draft);
      }, 400);
    },

    attachAutoSave(form) {
      const handler = () => this.scheduleAutoSave();
      form.addEventListener("input", handler);
      form.addEventListener("change", handler);

      const search = App.dom.byId("companySearch");
      if (search) {
        search.addEventListener("input", handler);
        search.addEventListener("change", handler);
      }
    },

    setupSearch() {
      const search = App.dom.byId("companySearch");
      const results = App.dom.byId("companyResults");
      if (!search || !results) return;

      search.addEventListener("input", () => {
        const query = search.value.trim();
        if (!query) {
          results.style.display = "none";
          results.innerHTML = "";
          return;
        }

        const filtered = App.companies.search(query, 15);

        if (!filtered.length) {
          results.innerHTML = '<div class="search-result-item">لا توجد نتائج</div>';
          results.style.display = "block";
          return;
        }

        results.innerHTML = filtered.map((company) => {
          const normalized = App.companies.normalize(company);
          return `
            <div class="search-result-item" data-number="${App.utils.safeText(normalized.Number)}">
              <span class="company-number">#${App.utils.safeText(normalized.Number)} — إجازة: ${App.utils.safeText(normalized.LicenseApprovalNumber)}</span>
              <span class="company-name">${App.utils.safeText(normalized.CompanyNameProject)}</span>
              <span class="company-brand">${App.utils.safeText(normalized.Brand)}</span>
            </div>
          `;
        }).join("");

        results.querySelectorAll(".search-result-item[data-number]").forEach((item) => {
          item.addEventListener("click", function () {
            const company = App.companies.findByNumber(item.dataset.number);
            if (!company) return;

            App.companies.fillForm(company);
            App.storage.saveSelectedCompany(company);
            search.value = `${company.Number || ""} - ${company.CompanyNameProject || ""}`.trim();
            results.style.display = "none";
            App.formPage.scheduleAutoSave();
            App.utils.showStatus("تم تعبئة بيانات الشركة", "success");
          });
        });

        results.style.display = "block";
      });

      document.addEventListener("click", function (event) {
        if (!search.contains(event.target) && !results.contains(event.target)) {
          results.style.display = "none";
        }
      });
    },

    fillFromSelectedCompany() {
      const form = App.dom.byId("docForm");
      if (!form) return;

      const company = App.storage.readSelectedCompany();
      if (!company || !company.CompanyNameProject) return;

      App.companies.fillForm(company);

      const search = App.dom.byId("companySearch");
      if (search) {
        search.value = `${company.Number || ""} - ${company.CompanyNameProject || ""}`.trim();
      }

      App.utils.showStatus("تم جلب بيانات الشركة من صفحة البحث", "success");
    },

    resetForm(form) {
      form.reset();
      this.clearFieldErrors();
      App.storage.clearDoc();
      App.storage.clearDraft();
      App.storage.clearSelectedCompany();

      const search = App.dom.byId("companySearch");
      const results = App.dom.byId("companyResults");

      if (search) search.value = "";
      if (results) {
        results.innerHTML = "";
        results.style.display = "none";
      }

      App.utils.setDefaultDateTime();
      App.utils.showStatus("تم مسح الحقول والبيانات المخزنة", "info");
    },

    normalizeVehicleNumber(value) {
      return String(value ?? "")
        .replace(/دهوك/g, "")           // حذف كلمة دهوك
        .replace(/[^\d٠-٩\s\-\/]/g, "") // حذف أي نص عربي آخر
        .replace(/\s+/g, " ")
        .trim();
    },

    attachInputRules() {
      const vehicle = App.dom.getFormField("vehicle_number");
      if (vehicle) {
        vehicle.setAttribute("inputmode", "numeric");
        vehicle.setAttribute("placeholder", "أرقام فقط");
        vehicle.addEventListener("input", () => {
          const cleaned = this.normalizeVehicleNumber(vehicle.value);
          if (vehicle.value !== cleaned) vehicle.value = cleaned;
          this.markFieldState("vehicle_number", false);
        });
      }

      const docIdField = App.dom.getFormField("doc_id");
      if (docIdField) {
        docIdField.setAttribute("inputmode", "numeric");
        docIdField.addEventListener("input", () => {
          const cleaned = docIdField.value.replace(/[^\d٠-٩]/g, "");
          if (docIdField.value !== cleaned) docIdField.value = cleaned;
          this.markFieldState("doc_id", false);
        });
      }


      const qrFileField = App.dom.byId("qr_file");
      if (qrFileField) {
        qrFileField.addEventListener("change", () => {
          this.markQrFileState(false);
        });
      }

      ["weight_quantity", "production_capacity", "document_value_usd"].forEach((name) => {
        const field = App.dom.getFormField(name);
        if (!field) return;

        field.setAttribute("inputmode", "decimal");
        field.addEventListener("input", () => {
          const cleaned = field.value.replace(/[^\d٠-٩.,٫]/g, "");
          if (field.value !== cleaned) field.value = cleaned;
          this.markFieldState(name, false);
        });
      });

      Object.keys(this.dateRuleMap).forEach((name) => {
        const field = App.dom.getFormField(name);
        if (!field) return;

        if (name === "license_approval_date") {
          field.setAttribute("placeholder", "0000-00-00");
        }

        field.setAttribute("dir", "ltr");
        field.setAttribute("maxlength", "10");
        field.setAttribute("inputmode", "numeric");

        field.addEventListener("input", () => {
          const formatted = this.formatIsoDateTyping(field.value);
          if (field.value !== formatted) field.value = formatted;
          this.markFieldState(name, false);
        });
      });
    },

    enableNativeHints() {
      this.requiredFields.forEach((field) => {
        const input = App.dom.getFormField(field.name);
        if (!input) return;
        input.required = true;
        input.setAttribute("data-required-label", field.label);
      });
    },


    getDriverSearchElements() {
      return {
        input: App.dom.getFormField("driver_name"),
        vehicle: App.dom.getFormField("vehicle_number"),
        governorate: App.dom.getFormField("registration_governorate"),
        panel: App.dom.byId("driverSuggestions"),
        body: App.dom.byId("driverSuggestionsBody")
      };
    },

    buildDriverRowHtml(driver, index) {
      return `
        <button class="driver-suggestion-row" type="button" data-driver-index="${index}">
          <span class="driver-suggestion-col driver-suggestion-order">${index + 1}</span>
          <span class="driver-suggestion-col driver-suggestion-name">${App.utils.safeText(driver.driver_name)}</span>
          <span class="driver-suggestion-col driver-suggestion-vehicle">${App.utils.safeText(driver.vehicle_number)}</span>
          <span class="driver-suggestion-col driver-suggestion-vehicle">${App.utils.safeText(driver.registration_governorate || "-")}</span>
        </button>
      `;
    },

    hideDriverSuggestions() {
      const { panel, body } = this.getDriverSearchElements();
      if (!panel || !body) return;
      panel.style.display = "none";
      body.innerHTML = "";
      this.currentDriverMatches = [];
    },

    selectDriverSuggestion(driver) {
      const { input, vehicle, governorate } = this.getDriverSearchElements();
      if (input) input.value = driver.driver_name || "";
      if (vehicle) vehicle.value = this.normalizeVehicleNumber(driver.vehicle_number || "");
      if (governorate) governorate.value = driver.registration_governorate || "";
      this.hideDriverSuggestions();
      this.markFieldState("driver_name", false);
      this.markFieldState("vehicle_number", false);
      this.markFieldState("registration_governorate", false);
      this.scheduleAutoSave();
      App.utils.showStatus("تم تعبئة بيانات السائق من السجل المحفوظ", "success");
    },

    renderDriverSuggestions(matches) {
      const { panel, body } = this.getDriverSearchElements();
      if (!panel || !body) return;

      if (!matches.length) {
        this.hideDriverSuggestions();
        return;
      }

      this.currentDriverMatches = matches.slice();
      body.innerHTML = matches.map((driver, index) => this.buildDriverRowHtml(driver, index)).join("");
      panel.style.display = "block";

      body.querySelectorAll("[data-driver-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const item = this.currentDriverMatches[Number(button.dataset.driverIndex)];
          if (!item) return;
          this.selectDriverSuggestion(item);
        });
      });
    },

    searchSavedDrivers(query) {
      const normalizedQuery = App.utils.normalizeSearchText(query);
      const drivers = App.storage.getDrivers();
      if (!normalizedQuery) return drivers.slice(0, 15);

      return drivers.filter((driver) => {
        const name = App.utils.normalizeSearchText(driver.driver_name);
        const vehicle = App.utils.normalizeSearchText(driver.vehicle_number);
        const governorate = App.utils.normalizeSearchText(driver.registration_governorate);
        return (
          name.startsWith(normalizedQuery) ||
          name.includes(normalizedQuery) ||
          vehicle.startsWith(normalizedQuery) ||
          vehicle.includes(normalizedQuery) ||
          governorate.startsWith(normalizedQuery) ||
          governorate.includes(normalizedQuery)
        );
      }).slice(0, 15);
    },

    setupDriverAutocomplete() {
      const { input, panel } = this.getDriverSearchElements();
      if (!input || !panel) return;

      const render = () => {
        const matches = this.searchSavedDrivers(input.value);
        this.renderDriverSuggestions(matches);
      };

      input.addEventListener("focus", render);
      input.addEventListener("input", () => {
        this.markFieldState("driver_name", false);
        render();
      });

      document.addEventListener("click", (event) => {
        const { input: field, panel: currentPanel } = this.getDriverSearchElements();
        if (!field || !currentPanel) return;
        if (field.contains(event.target) || currentPanel.contains(event.target)) return;
        this.hideDriverSuggestions();
      });
    },


    getTraderSearchElements() {
      return {
        input: App.dom.getFormField("trader_name"),
        panel: App.dom.byId("traderSuggestions"),
        body: App.dom.byId("traderSuggestionsBody")
      };
    },

    hideTraderSuggestions() {
      const { panel, body } = this.getTraderSearchElements();
      if (panel) panel.style.display = "none";
      if (body) body.innerHTML = "";
      this.currentTraderMatches = [];
    },

    selectTraderSuggestion(name) {
      const { input } = this.getTraderSearchElements();
      if (input) input.value = name;
      this.hideTraderSuggestions();
      this.markFieldState("trader_name", false);
      this.scheduleAutoSave();
    },

    renderTraderSuggestions(matches) {
      const { panel, body } = this.getTraderSearchElements();
      if (!panel || !body) return;

      if (!matches.length) {
        this.hideTraderSuggestions();
        return;
      }

      this.currentTraderMatches = matches.slice();
      body.innerHTML = matches.map((entry, index) => `
        <button class="driver-suggestion-row" type="button" data-trader-index="${index}">
          <span class="driver-suggestion-col driver-suggestion-order">${index + 1}</span>
          <span class="driver-suggestion-col driver-suggestion-name">${App.utils.safeText(entry.name)}</span>
        </button>
      `).join("");
      panel.style.display = "block";

      body.querySelectorAll("[data-trader-index]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = this.currentTraderMatches[Number(btn.dataset.traderIndex)];
          if (item) this.selectTraderSuggestion(item.name);
        });
      });
    },

    searchTraders(query) {
      const traders = App.storage.getTraders();
      if (!query.trim()) return traders;
      const q = App.utils.normalizeSearchText(query);
      return traders.filter((t) => App.utils.normalizeSearchText(t.name).includes(q));
    },

    setupTraderAutocomplete() {
      const { input, panel } = this.getTraderSearchElements();
      if (!input || !panel) return;

      this.currentTraderMatches = [];

      const render = () => {
        const matches = this.searchTraders(input.value);
        this.renderTraderSuggestions(matches);
      };

      input.addEventListener("focus", render);
      input.addEventListener("input", () => {
        this.markFieldState("trader_name", false);
        render();
      });

      document.addEventListener("click", (event) => {
        const { input: field, panel: currentPanel } = this.getTraderSearchElements();
        if (!field || !currentPanel) return;
        if (field.contains(event.target) || currentPanel.contains(event.target)) return;
        this.hideTraderSuggestions();
      });
    },

    saveTraderTransaction(doc) {
      return App.storage.saveTraderTransaction({
        trader_name: doc.trader_name,
        company_name_project: doc.company_name_project,
        driver_name: doc.driver_name,
        destination_governorate: doc.destination_governorate,
        document_value_usd: doc.document_value_usd,
        doc_id: doc.doc_id,
        date_str: doc.date_str
      });
    },

    saveCurrentDriver() {
      const driver_name = App.dom.getFormValue("driver_name").trim();
      const vehicle_number = App.dom.getFormValue("vehicle_number").trim();
      const registration_governorate = App.dom.getFormValue("registration_governorate").trim();
      if (!driver_name || !vehicle_number) return false;
      return App.storage.saveDriver({
        driver_name,
        vehicle_number,
        registration_governorate,
        created_at: new Date().toISOString()
      });
    },

    async init() {
      const form = App.dom.byId("docForm");
      if (!form) return;

      this.enableNativeHints();
      this.attachInputRules();
      App.utils.setDefaultDateTime();
      await App.companies.load();
      this.setupSearch();
      this.setupDriverAutocomplete();
      this.setupTraderAutocomplete();
      this.fillFromSelectedCompany();
      this.restoreDraft();
      this.attachAutoSave(form);

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!this.validateBeforeSubmit()) return;

        const qrBase64 = await this.getQrUploadBase64();
        App.dom.setFormValue("qr_image_data", qrBase64 || "");

        const doc = this.buildDocObject();
        const saved = App.storage.saveDoc(doc);
        if (!saved) return;
        this.saveCurrentDriver();
        this.saveTraderTransaction(doc);
        App.storage.clearDraft();
        App.storage.clearSelectedCompany();
        window.location.href = "document.html?ts=" + Date.now();
      });

      const clearBtn = App.dom.byId("clearBtn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => this.resetForm(form));
      }
    }
  };
})(window.App);