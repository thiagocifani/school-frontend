"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { classApi, adminApi } from "@/lib/api";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  IdCard,
  Home,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
  DollarSign
} from "lucide-react";
import type { Student, SchoolClass } from "@/types";

const guardianSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório").trim(),
  email: z.string().email("Email inválido").trim(),
  phone: z.string().min(1, "Telefone é obrigatório").refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length >= 10;
  }, "Telefone deve ter pelo menos 10 dígitos"),
  cpf: z.string().min(1, "CPF é obrigatório").refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 11;
  }, "CPF deve ter exatamente 11 dígitos"),
  birthDate: z.string().optional().or(z.literal("")),
  rg: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).default("single"),
  address: z.string().min(1, "Endereço é obrigatório").trim(),
  neighborhood: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // CEP é opcional
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 8;
  }, "CEP deve ter 8 dígitos"),
  emergencyPhone: z.string().optional().or(z.literal("")),
  relationship: z.string().min(1, "Relacionamento é obrigatório").trim(),
  isFinancialResponsible: z.coerce.boolean().default(false),
  password: z.string().optional().or(z.literal("")),
});

const studentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").trim(),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  registrationNumber: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "transferred"]).default("active"),
  schoolClassId: z.number().optional().nullable(),
  cpf: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // CPF é opcional
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 11;
  }, "CPF deve ter exatamente 11 dígitos"),
  gender: z.enum(["male", "female", "other"]).default("male"),
  birthPlace: z.string().optional().or(z.literal("")),
  // Financial information
  tuitionDiscount: z.number().min(0, "Desconto deve ser um valor positivo").max(100, "Desconto não pode ser maior que 100%").default(0),
  // Medical and family information
  hasSiblingEnrolled: z.coerce.boolean().default(false),
  siblingName: z.string().optional().or(z.literal("")),
  hasSpecialistMonitoring: z.coerce.boolean().default(false),
  specialistDetails: z.string().optional().or(z.literal("")),
  hasMedicationAllergy: z.coerce.boolean().default(false),
  medicationAllergyDetails: z.string().optional().or(z.literal("")),
  hasFoodAllergy: z.coerce.boolean().default(false),
  foodAllergyDetails: z.string().optional().or(z.literal("")),
  hasMedicalTreatment: z.coerce.boolean().default(false),
  medicalTreatmentDetails: z.string().optional().or(z.literal("")),
  usesSpecificMedication: z.coerce.boolean().default(false),
  specificMedicationDetails: z.string().optional().or(z.literal("")),
  guardians: z.array(guardianSchema).min(1, "Pelo menos um responsável é necessário"),
}).superRefine((data, ctx) => {
  // Conditional validations for medical fields
  if (data.hasSiblingEnrolled && !data.siblingName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["siblingName"],
      message: "Nome do irmão é obrigatório quando tem irmão matriculado",
    });
  }
  if (data.hasSpecialistMonitoring && !data.specialistDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["specialistDetails"],
      message: "Detalhes do especialista são obrigatórios",
    });
  }
  if (data.hasMedicationAllergy && !data.medicationAllergyDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["medicationAllergyDetails"],
      message: "Detalhes da alergia medicamentosa são obrigatórios",
    });
  }
  if (data.hasFoodAllergy && !data.foodAllergyDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["foodAllergyDetails"],
      message: "Detalhes da alergia alimentar são obrigatórios",
    });
  }
  if (data.hasMedicalTreatment && !data.medicalTreatmentDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["medicalTreatmentDetails"],
      message: "Detalhes do tratamento médico são obrigatórios",
    });
  }
  if (data.usesSpecificMedication && !data.specificMedicationDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["specificMedicationDetails"],
      message: "Detalhes da medicação específica são obrigatórios",
    });
  }
  
  // Financial responsibility validation
  const financialGuardians = data.guardians.filter(guardian => guardian.isFinancialResponsible);
  if (financialGuardians.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["guardians"],
      message: "Pelo menos um responsável deve ser marcado como responsável financeiro",
    });
  }
  
  if (financialGuardians.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["guardians"],
      message: "Apenas um responsável pode ser marcado como responsável financeiro",
    });
  }
  
  // Password validation for financial guardians
  data.guardians.forEach((guardian, index) => {
    if (guardian.isFinancialResponsible && (!guardian.password || guardian.password.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guardians", index, "password"],
        message: "Senha é obrigatória para o responsável financeiro",
      });
    }
    
    if (guardian.isFinancialResponsible && guardian.password && guardian.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guardians", index, "password"],
        message: "A senha deve ter pelo menos 6 caracteres",
      });
    }
  });
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StudentForm({
  student,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StudentFormProps) {
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [currentTab, setCurrentTab] = useState("student");
  const [addressLoading, setAddressLoading] = useState<{[key: number]: boolean}>({});
  const [guardianSearch, setGuardianSearch] = useState({
    searching: false,
    results: [] as any[],
    searchTerm: "",
    showResults: false
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || "",
      birthDate: student?.birth_date || student?.birthDate || "",
      registrationNumber: student?.registration_number || student?.registrationNumber || "",
      status: student?.status || "active",
      schoolClassId: student?.schoolClass?.id,
      cpf: student?.cpf || "",
      gender: student?.gender || "male",
      birthPlace: student?.birth_place || student?.birthPlace || "",
      // Medical and family information (converting from snake_case API response)
      hasSiblingEnrolled: student?.has_sibling_enrolled || student?.hasSiblingEnrolled || false,
      siblingName: student?.sibling_name || student?.siblingName || "",
      hasSpecialistMonitoring: student?.has_specialist_monitoring || student?.hasSpecialistMonitoring || false,
      specialistDetails: student?.specialist_details || student?.specialistDetails || "",
      hasMedicationAllergy: student?.has_medication_allergy || student?.hasMedicationAllergy || false,
      medicationAllergyDetails: student?.medication_allergy_details || student?.medicationAllergyDetails || "",
      hasFoodAllergy: student?.has_food_allergy || student?.hasFoodAllergy || false,
      foodAllergyDetails: student?.food_allergy_details || student?.foodAllergyDetails || "",
      hasMedicalTreatment: student?.has_medical_treatment || student?.hasMedicalTreatment || false,
      medicalTreatmentDetails: student?.medical_treatment_details || student?.medicalTreatmentDetails || "",
      usesSpecificMedication: student?.uses_specific_medication || student?.usesSpecificMedication || false,
      specificMedicationDetails: student?.specific_medication_details || student?.specificMedicationDetails || "",
      guardians: student?.guardians?.map(g => ({
        id: g.id,
        name: g.name,
        email: g.email,
        phone: g.phone,
        cpf: g.cpf,
        birthDate: g.birthDate,
        rg: g.rg,
        profession: g.profession,
        maritalStatus: g.maritalStatus || "single",
        address: g.address,
        neighborhood: g.neighborhood,
        complement: g.complement,
        zipCode: g.zipCode,
        emergencyPhone: g.emergencyPhone,
        relationship: g.relationship,
        isFinancialResponsible: g.isFinancialResponsible || false,
        password: g.password || "",
      })) || [
        {
          name: "",
          email: "",
          phone: "",
          cpf: "",
          birthDate: "",
          rg: "",
          profession: "",
          maritalStatus: "single" as const,
          address: "",
          neighborhood: "",
          complement: "",
          zipCode: "",
          emergencyPhone: "",
          relationship: "",
          isFinancialResponsible: false,
          password: "",
        },
      ],
    },
  });

  // Watch the sibling enrolled field to show guardian search when needed
  const hasSiblingEnrolled = watch("hasSiblingEnrolled", false);
  
  // Watch guardians array to check financial responsibility status
  const watchedGuardians = watch("guardians", []);

  const handleFormSubmit = (data: StudentFormData) => {
    console.log("🐛 DEBUG - Dados do formulário antes da formatação:", data);
    console.log("🐛 DEBUG - schoolClassId value:", data.schoolClassId, typeof data.schoolClassId);
    
    // Transformar os dados para o formato esperado pelo backend (snake_case)
    const formattedData = {
      ...data,
      // Convert camelCase medical fields to snake_case for API
      has_sibling_enrolled: data.hasSiblingEnrolled,
      sibling_name: data.siblingName,
      has_specialist_monitoring: data.hasSpecialistMonitoring,
      specialist_details: data.specialistDetails,
      has_medication_allergy: data.hasMedicationAllergy,
      medication_allergy_details: data.medicationAllergyDetails,
      has_food_allergy: data.hasFoodAllergy,
      food_allergy_details: data.foodAllergyDetails,
      has_medical_treatment: data.hasMedicalTreatment,
      medical_treatment_details: data.medicalTreatmentDetails,
      uses_specific_medication: data.usesSpecificMedication,
      specific_medication_details: data.specificMedicationDetails,
      // Convert birth_date and birth_place to snake_case
      birth_date: data.birthDate,
      birth_place: data.birthPlace,
      school_class_id: data.schoolClassId || null,
      registration_number: data.registrationNumber,
      guardians_attributes: data.guardians.map((guardian, index) => ({
        ...guardian,
        // Convert guardian fields to snake_case
        birth_date: guardian.birthDate,
        marital_status: guardian.maritalStatus,
        zip_code: guardian.zipCode,
        // Add financial responsibility fields
        is_financial_responsible: guardian.isFinancialResponsible,
        password: guardian.password || null,
        emergency_phone: guardian.emergencyPhone,
        _index: index,
      }))
    };
    
    // Remove camelCase fields that were converted
    delete (formattedData as any).guardians;
    delete (formattedData as any).hasSiblingEnrolled;
    delete (formattedData as any).siblingName;
    delete (formattedData as any).hasSpecialistMonitoring;
    delete (formattedData as any).specialistDetails;
    delete (formattedData as any).hasMedicationAllergy;
    delete (formattedData as any).medicationAllergyDetails;
    delete (formattedData as any).hasFoodAllergy;
    delete (formattedData as any).foodAllergyDetails;
    delete (formattedData as any).hasMedicalTreatment;
    delete (formattedData as any).medicalTreatmentDetails;
    delete (formattedData as any).usesSpecificMedication;
    delete (formattedData as any).specificMedicationDetails;
    delete (formattedData as any).birthDate;
    delete (formattedData as any).birthPlace;
    delete (formattedData as any).schoolClassId;
    delete (formattedData as any).registrationNumber;
    
    console.log("🐛 DEBUG - Dados formatados para envio:", formattedData);
    console.log("🐛 DEBUG - school_class_id final:", formattedData.school_class_id);
    
    onSubmit(formattedData);
  };

  const { fields: guardianFields, append: appendGuardian, remove: removeGuardian } = useFieldArray({
    control,
    name: "guardians",
  });

  // Load school classes on mount
  useEffect(() => {
    const loadSchoolClasses = async () => {
      console.log('🔍 Loading school classes...');
      setLoadingClasses(true);
      try {
        const { data } = await classApi.getAll();
        console.log('🔍 School classes loaded:', data);
        setSchoolClasses(data);
      } catch (error) {
        console.error('❌ Error loading school classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    loadSchoolClasses();
  }, []);

  // Reset form when student changes
  useEffect(() => {
    if (student) {
      const guardians = student.guardians?.map(g => ({
        id: g.id,
        name: g.name || "",
        email: g.email || "",
        phone: g.phone || "",
        cpf: g.cpf || "",
        birthDate: g.birth_date || g.birthDate || "",
        rg: g.rg || "",
        profession: g.profession || "",
        maritalStatus: g.marital_status || g.maritalStatus || "single" as const,
        address: g.address || "",
        neighborhood: g.neighborhood || "",
        complement: g.complement || "",
        zipCode: g.zip_code || g.zipCode || "",
        emergencyPhone: g.emergency_phone || g.emergencyPhone || "",
        relationship: g.relationship || "",
      })) || [];

      // Se não há responsáveis, adiciona um vazio
      if (guardians.length === 0) {
        guardians.push({
          name: "",
          email: "",
          phone: "",
          cpf: "",
          birthDate: "",
          rg: "",
          profession: "",
          maritalStatus: "single" as const,
          address: "",
          neighborhood: "",
          complement: "",
          zipCode: "",
          emergencyPhone: "",
          relationship: "",
        });
      }

      // Reset todos os valores do form
      const schoolClass = student.schoolClass || student.school_class;
      console.log("🔍 Setting form values - student school class:", {
        schoolClass: schoolClass,
        schoolClassId: schoolClass?.id,
        schoolClassIdType: typeof schoolClass?.id
      });
      setValue("name", student.name || "");
      setValue("birthDate", student.birth_date || student.birthDate || "");
      setValue("registrationNumber", student.registration_number || student.registrationNumber || "");
      setValue("status", student.status || "active");
      console.log("🔍 Setting schoolClassId to:", schoolClass?.id || null);
      setValue("schoolClassId", schoolClass?.id || null);
      setValue("cpf", student.cpf || "");
      setValue("gender", student.gender || "male");
      setValue("birthPlace", student.birth_place || student.birthPlace || "");
      
      // Medical information fields
      setValue("hasSiblingEnrolled", student.has_sibling_enrolled || student.hasSiblingEnrolled || false);
      setValue("siblingName", student.sibling_name || student.siblingName || "");
      setValue("hasSpecialistMonitoring", student.has_specialist_monitoring || student.hasSpecialistMonitoring || false);
      setValue("specialistDetails", student.specialist_details || student.specialistDetails || "");
      setValue("hasMedicationAllergy", student.has_medication_allergy || student.hasMedicationAllergy || false);
      setValue("medicationAllergyDetails", student.medication_allergy_details || student.medicationAllergyDetails || "");
      setValue("hasFoodAllergy", student.has_food_allergy || student.hasFoodAllergy || false);
      setValue("foodAllergyDetails", student.food_allergy_details || student.foodAllergyDetails || "");
      setValue("hasMedicalTreatment", student.has_medical_treatment || student.hasMedicalTreatment || false);
      setValue("medicalTreatmentDetails", student.medical_treatment_details || student.medicalTreatmentDetails || "");
      setValue("usesSpecificMedication", student.uses_specific_medication || student.usesSpecificMedication || false);
      setValue("specificMedicationDetails", student.specific_medication_details || student.specificMedicationDetails || "");
      
      setValue("guardians", guardians);
    }
  }, [student, setValue]);

  // Function to format CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Function to format phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Function to format CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  // Function to fetch address from CEP
  const fetchAddressFromCEP = async (cep: string, guardianIndex: number) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setAddressLoading(prev => ({ ...prev, [guardianIndex]: true }));
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue(`guardians.${guardianIndex}.address`, `${data.logradouro}, ${data.bairro}`);
        setValue(`guardians.${guardianIndex}.neighborhood`, data.bairro);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setAddressLoading(prev => ({ ...prev, [guardianIndex]: false }));
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Function to search for existing guardians by CPF
  const searchGuardians = async (searchTerm: string) => {
    console.log('🔍 Iniciando busca por responsáveis:', { searchTerm });

    if (!searchTerm.trim() || searchTerm.length < 3) {
      console.log('⚠️ Termo de busca muito curto ou vazio');
      setGuardianSearch(prev => ({ ...prev, results: [], showResults: false }));
      return;
    }

    setGuardianSearch(prev => ({ ...prev, searching: true, searchTerm }));
    
    try {
      console.log('🚀 Fazendo chamada para API...');
      
      // Estratégia 1: Buscar por CPF formatado
      let response;
      const cleanCPF = searchTerm.replace(/\D/g, ''); // Remove formatação
      
      console.log('📞 Chamada 1: CPF formatado', { original: searchTerm, clean: cleanCPF });
      response = await adminApi.guardians.getAll({ cpf: searchTerm });
      console.log('📞 Resposta 1:', response);
      
      // Se não encontrou, tenta com CPF limpo
      if (!response.data || response.data.length === 0) {
        console.log('📞 Chamada 2: CPF limpo');
        response = await adminApi.guardians.getAll({ cpf: cleanCPF });
        console.log('📞 Resposta 2:', response);
      }
      
      // Se ainda não encontrou, tenta busca genérica
      if (!response.data || response.data.length === 0) {
        console.log('📞 Chamada 3: Busca genérica');
        response = await adminApi.guardians.getAll({ search: searchTerm });
        console.log('📞 Resposta 3:', response);
      }

      // Processar dados da resposta
      let guardians = [];
      if (response && response.data) {
        console.log('✅ Dados encontrados na API:', response.data);
        
        // Se data é um array
        if (Array.isArray(response.data)) {
          guardians = response.data;
        }
        // Se data tem propriedade guardians
        else if (response.data.guardians && Array.isArray(response.data.guardians)) {
          guardians = response.data.guardians;
        }
        // Se data é um objeto único
        else if (response.data.id) {
          guardians = [response.data];
        }
      }

      // Filtro local adicional por CPF se necessário
      if (guardians.length > 0 && cleanCPF.length >= 3) {
        const filtered = guardians.filter(guardian => {
          const guardianCPF = (guardian.user?.cpf || guardian.cpf || '').replace(/\D/g, '');
          return guardianCPF.includes(cleanCPF);
        });
        if (filtered.length > 0) {
          guardians = filtered;
        }
      }

      console.log('🎯 Guardians processados para exibição:', guardians);
      
      setGuardianSearch(prev => ({
        ...prev,
        results: guardians,
        showResults: true,
        searching: false
      }));
      
      console.log('🔄 Estado atualizado, showResults:', true, 'results:', guardians);
      
    } catch (error) {
      console.error('❌ Erro na busca por responsáveis:', error);
      setGuardianSearch(prev => ({ 
        ...prev, 
        results: [], 
        showResults: false,
        searching: false 
      }));
    }
  };

  // Function to select an existing guardian
  const selectExistingGuardian = (guardian: any) => {
    const existingGuardian = {
      id: guardian.id,
      name: guardian.user?.name || guardian.name,
      email: guardian.user?.email || guardian.email,
      phone: guardian.user?.phone || guardian.phone,
      cpf: guardian.user?.cpf || guardian.cpf,
      birthDate: guardian.birth_date || guardian.birthDate || "",
      rg: guardian.rg || "",
      profession: guardian.profession || "",
      maritalStatus: guardian.marital_status || guardian.maritalStatus || "single",
      address: guardian.address || "",
      neighborhood: guardian.neighborhood || "",
      complement: guardian.complement || "",
      zipCode: guardian.zip_code || guardian.zipCode || "",
      emergencyPhone: guardian.emergency_phone || guardian.emergencyPhone || "",
      relationship: "", // This will need to be filled by user
    };

    // Add the selected guardian to the form
    append(existingGuardian);
    
    // Clear search
    setGuardianSearch({
      searching: false,
      results: [],
      searchTerm: "",
      showResults: false
    });
  };

  const studentBirthDate = watch('birthDate', '');
  const studentAge = calculateAge(studentBirthDate);

  // Debug: Log form state changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('🔍 Form Validation Errors:', {
        errors,
        isValid,
        guardianFieldsLength: guardianFields.length,
        student: student?.name || 'new'
      });
    }
  }, [errors, isValid, guardianFields.length, student]);

  // Debug: Log school class selection changes
  const schoolClassIdValue = watch('schoolClassId', null);
  useEffect(() => {
    console.log('🔍 School Class Selection Changed:', {
      schoolClassIdValue,
      type: typeof schoolClassIdValue,
      schoolClassesCount: schoolClasses.length,
      selectedClass: schoolClasses.find(sc => sc.id === schoolClassIdValue),
      formMode: student ? 'edit' : 'create'
    });
  }, [schoolClassIdValue, schoolClasses.length, student]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                {student ? "Editar Aluno" : "Novo Aluno"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {student ? `Editando dados de ${student.name}` : "Preencha os dados do novo aluno e seus responsáveis"}
              </p>
            </div>
            {studentAge && (
              <Badge variant="outline" className="ml-2">
                {studentAge} {studentAge === 1 ? 'ano' : 'anos'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados do Aluno
                  {dirtyFields.name && <CheckCircle className="h-3 w-3 text-green-600" />}
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Info. Médicas
                  {(watch('hasSiblingEnrolled', false) || watch('hasSpecialistMonitoring', false) || watch('hasMedicationAllergy', false) || watch('hasFoodAllergy', false) || watch('hasMedicalTreatment', false) || watch('usesSpecificMedication', false)) && <CheckCircle className="h-3 w-3 text-green-600" />}
                </TabsTrigger>
                <TabsTrigger value="guardians" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Responsáveis ({guardianFields.length})
                  {guardianFields.length > 0 && <CheckCircle className="h-3 w-3 text-green-600" />}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IdCard className="h-5 w-5" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Ex: João Silva Santos"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium mb-2">
                        CPF
                      </label>
                      <Input
                        id="cpf"
                        {...register("cpf", {
                          onChange: (e) => {
                            const formatted = formatCPF(e.target.value);
                            setValue('cpf', formatted);
                          }
                        })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={errors.cpf ? "border-red-500" : ""}
                      />
                      {errors.cpf && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.cpf.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
                        Data de Nascimento *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="birthDate" 
                          type="date" 
                          {...register("birthDate")} 
                          className={`pl-10 ${errors.birthDate ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.birthDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.birthDate.message}
                        </p>
                      )}
                      {studentAge && (
                        <p className="text-green-600 text-sm mt-1">
                          Idade: {studentAge} {studentAge === 1 ? 'ano' : 'anos'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium mb-2">
                        Gênero *
                      </label>
                      <select
                        id="gender"
                        {...register("gender")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="birthPlace" className="block text-sm font-medium mb-2">
                        Local de Nascimento
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="birthPlace"
                          {...register("birthPlace")}
                          placeholder="Ex: São Paulo, SP"
                          className="pl-10"
                        />
                      </div>
                      {errors.birthPlace && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.birthPlace.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Informações Acadêmicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="schoolClassId" className="block text-sm font-medium mb-2">
                        Turma
                      </label>
                      <select
                        id="schoolClassId"
                        {...register("schoolClassId", {
                          setValueAs: (value) => value === "" || value === "null" ? null : parseInt(value)
                        })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={loadingClasses}
                      >
                        <option value="">Selecione uma turma</option>
                        {schoolClasses.map((schoolClass) => (
                          <option key={schoolClass.id} value={schoolClass.id}>
                            {schoolClass.name} - {schoolClass.period}
                          </option>
                        ))}
                      </select>
                      {loadingClasses && (
                        <p className="text-gray-500 text-sm mt-1">Carregando turmas...</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="registrationNumber" className="block text-sm font-medium mb-2">
                        Número de Matrícula
                      </label>
                      <Input
                        id="registrationNumber"
                        {...register("registrationNumber")}
                        placeholder="Gerado automaticamente"
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Será gerado automaticamente ao salvar
                      </p>
                    </div>

                    <div>
                      <label htmlFor="tuitionDiscount" className="block text-sm font-medium mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Desconto na Mensalidade (%)
                        </div>
                      </label>
                      <Input
                        id="tuitionDiscount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...register("tuitionDiscount", {
                          setValueAs: (value) => value === "" ? 0 : parseFloat(value)
                        })}
                        placeholder="0"
                        className={errors.tuitionDiscount ? "border-red-500" : ""}
                      />
                      {errors.tuitionDiscount && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.tuitionDiscount.message}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Desconto aplicado na mensalidade (0-100%)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        id="status"
                        {...register("status")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="transferred">Transferido</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                {/* Family Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informações Familiares
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Has sibling enrolled */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Tem irmão matriculado nessa escola?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasSiblingEnrolled")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasSiblingEnrolled")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('hasSiblingEnrolled', false) && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="siblingName" className="block text-sm font-medium mb-2">
                              Nome do irmão *
                            </label>
                            <Input
                              id="siblingName"
                              {...register("siblingName")}
                              placeholder="Nome completo do irmão"
                              className={errors.siblingName ? "border-red-500" : ""}
                            />
                            {errors.siblingName && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.siblingName.message}
                              </p>
                            )}
                          </div>
                          
                          {/* Guardian Search Section */}
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Search className="h-4 w-4 text-blue-600" />
                              <h4 className="text-sm font-medium text-blue-900">
                                Buscar responsável já cadastrado
                              </h4>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">
                              Como o aluno tem irmão matriculado, você pode buscar pelo CPF de um responsável já cadastrado para evitar duplicatas.
                            </p>
                            
                            <div className="space-y-3">
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="Digite o CPF do responsável (ex: 123.456.789-01)"
                                  value={guardianSearch.searchTerm}
                                  onChange={(e) => {
                                    const cleanValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                    const formattedValue = formatCPF(cleanValue); // Format for display
                                    setGuardianSearch(prev => ({ ...prev, searchTerm: formattedValue }));
                                    searchGuardians(formattedValue); // Search with formatted CPF
                                  }}
                                  className="pl-10"
                                />
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                                {guardianSearch.searching && (
                                  <div className="absolute right-3 top-3">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Search Results */}
                              {guardianSearch.showResults && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
                                  {guardianSearch.results.length > 0 ? (
                                    <div className="divide-y">
                                      {guardianSearch.results.map((guardian: any) => (
                                        <div
                                          key={guardian.id}
                                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                          onClick={() => selectExistingGuardian(guardian)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="font-medium text-sm">
                                                {guardian.user?.name || guardian.name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                CPF: {guardian.user?.cpf || guardian.cpf}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                Email: {guardian.user?.email || guardian.email}
                                              </p>
                                            </div>
                                            <Button
                                              type="button"
                                              size="sm"
                                              className="text-xs"
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Adicionar
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-3 text-center text-sm text-gray-500">
                                      {guardianSearch.searchTerm.length >= 3 ? 
                                        "Nenhum responsável encontrado com este CPF" :
                                        "Digite pelo menos 3 números do CPF para buscar"
                                      }
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {guardianFields.length > 0 && (
                              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {guardianFields.length} responsável(eis) adicionado(s). Você pode continuar adicionando mais ou prosseguir para a aba "Responsáveis" para completar os dados.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Informações Médicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Specialist monitoring */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        O(a) aluno(a) tem acompanhamento de algum especialista?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasSpecialistMonitoring")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasSpecialistMonitoring")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('hasSpecialistMonitoring', false) && (
                        <div>
                          <label htmlFor="specialistDetails" className="block text-sm font-medium mb-2">
                            Qual especialista e detalhes do acompanhamento? *
                          </label>
                          <textarea
                            id="specialistDetails"
                            {...register("specialistDetails")}
                            rows={3}
                            placeholder="Ex: Psicólogo - acompanhamento semanal para ansiedade"
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.specialistDetails ? "border-red-500" : ""}`}
                          />
                          {errors.specialistDetails && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.specialistDetails.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Medication allergy */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        O(a) aluno(a) é alérgico a algum medicamento?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasMedicationAllergy")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasMedicationAllergy")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('hasMedicationAllergy', false) && (
                        <div>
                          <label htmlFor="medicationAllergyDetails" className="block text-sm font-medium mb-2">
                            Qual medicamento e tipo de reação? *
                          </label>
                          <textarea
                            id="medicationAllergyDetails"
                            {...register("medicationAllergyDetails")}
                            rows={3}
                            placeholder="Ex: Penicilina - causa urticária e inchaço"
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.medicationAllergyDetails ? "border-red-500" : ""}`}
                          />
                          {errors.medicationAllergyDetails && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.medicationAllergyDetails.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Food allergy */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        O(a) aluno(a) é alérgico a algum alimento?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasFoodAllergy")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasFoodAllergy")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('hasFoodAllergy', false) && (
                        <div>
                          <label htmlFor="foodAllergyDetails" className="block text-sm font-medium mb-2">
                            Qual alimento e tipo de reação? *
                          </label>
                          <textarea
                            id="foodAllergyDetails"
                            {...register("foodAllergyDetails")}
                            rows={3}
                            placeholder="Ex: Amendoim - causa dificuldade respiratória"
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.foodAllergyDetails ? "border-red-500" : ""}`}
                          />
                          {errors.foodAllergyDetails && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.foodAllergyDetails.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Medical treatment */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        O(a) aluno(a) está fazendo algum tratamento médico?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasMedicalTreatment")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("hasMedicalTreatment")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('hasMedicalTreatment') && (
                        <div>
                          <label htmlFor="medicalTreatmentDetails" className="block text-sm font-medium mb-2">
                            Qual tratamento e detalhes? *
                          </label>
                          <textarea
                            id="medicalTreatmentDetails"
                            {...register("medicalTreatmentDetails")}
                            rows={3}
                            placeholder="Ex: Fisioterapia para lesão no joelho - 2x por semana"
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.medicalTreatmentDetails ? "border-red-500" : ""}`}
                          />
                          {errors.medicalTreatmentDetails && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.medicalTreatmentDetails.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Specific medication */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        O(a) aluno(a) faz uso de algum tipo de medicação específica?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("usesSpecificMedication")}
                            value="true"
                            className="w-4 h-4"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register("usesSpecificMedication")}
                            value="false"
                            className="w-4 h-4"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                      
                      {watch('usesSpecificMedication') && (
                        <div>
                          <label htmlFor="specificMedicationDetails" className="block text-sm font-medium mb-2">
                            Qual medicação e dosagem? *
                          </label>
                          <textarea
                            id="specificMedicationDetails"
                            {...register("specificMedicationDetails")}
                            rows={3}
                            placeholder="Ex: Ritalina 10mg - 1 comprimido pela manhã para TDAH"
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.specificMedicationDetails ? "border-red-500" : ""}`}
                          />
                          {errors.specificMedicationDetails && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.specificMedicationDetails.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guardians" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Responsáveis ({guardianFields.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cadastre pelo menos um responsável pelo aluno
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendGuardian({
                      name: "",
                      email: "",
                      phone: "",
                      cpf: "",
                      birthDate: "",
                      rg: "",
                      profession: "",
                      maritalStatus: "single" as const,
                      address: "",
                      neighborhood: "",
                      complement: "",
                      zipCode: "",
                      emergencyPhone: "",
                      relationship: "",
                    })}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Responsável
                  </Button>
                </div>

                {guardianFields.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      É necessário cadastrar pelo menos um responsável para o aluno.
                    </AlertDescription>
                  </Alert>
                )}

                {guardianFields.map((field, index) => {
                  const guardianErrors = errors.guardians?.[index];
                  const hasErrors = Object.keys(guardianErrors || {}).length > 0;
                  
                  return (
                    <Card key={field.id} className={`${hasErrors ? 'border-red-200' : 'border-border'}`}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <h4 className="text-md font-medium">Responsável {index + 1}</h4>
                            {hasErrors && (
                              <Badge variant="destructive" className="ml-2">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Erros
                              </Badge>
                            )}
                          </div>
                          {guardianFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGuardian(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">

                        {/* Personal Information */}
                        <div>
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Informações Pessoais
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                              <Input
                                {...register(`guardians.${index}.name`)}
                                placeholder="Ex: Maria Silva Santos"
                                className={errors.guardians?.[index]?.name ? "border-red-500" : ""}
                              />
                              {errors.guardians?.[index]?.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.guardians[index]?.name?.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">CPF *</label>
                              <Input
                                {...register(`guardians.${index}.cpf`, {
                                  onChange: (e) => {
                                    const formatted = formatCPF(e.target.value);
                                    setValue(`guardians.${index}.cpf`, formatted);
                                  }
                                })}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={errors.guardians?.[index]?.cpf ? "border-red-500" : ""}
                              />
                              {errors.guardians?.[index]?.cpf && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.guardians[index]?.cpf?.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Relacionamento com o Aluno *</label>
                              <select
                                {...register(`guardians.${index}.relationship`)}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.guardians?.[index]?.relationship ? "border-red-500" : ""}`}
                              >
                                <option value="">Selecione o relacionamento</option>
                                <option value="pai">Pai</option>
                                <option value="mãe">Mãe</option>
                                <option value="avô">Avô</option>
                                <option value="avó">Avó</option>
                                <option value="tio">Tio</option>
                                <option value="tia">Tia</option>
                                <option value="padrasto">Padrasto</option>
                                <option value="madrasta">Madrasta</option>
                                <option value="tutor">Tutor Legal</option>
                                <option value="responsável">Outro Responsável</option>
                              </select>
                              {errors.guardians?.[index]?.relationship && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.guardians[index]?.relationship?.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <div>
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Contato
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Email *</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="email"
                                  {...register(`guardians.${index}.email`)}
                                  placeholder="exemplo@email.com"
                                  className={`pl-10 ${errors.guardians?.[index]?.email ? "border-red-500" : ""}`}
                                />
                              </div>
                              {errors.guardians?.[index]?.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.guardians[index]?.email?.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Telefone Principal *</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...register(`guardians.${index}.phone`, {
                                    onChange: (e) => {
                                      const formatted = formatPhone(e.target.value);
                                      setValue(`guardians.${index}.phone`, formatted);
                                    }
                                  })}
                                  placeholder="(11) 99999-9999"
                                  maxLength={15}
                                  className={`pl-10 ${errors.guardians?.[index]?.phone ? "border-red-500" : ""}`}
                                />
                              </div>
                              {errors.guardians?.[index]?.phone && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.guardians[index]?.phone?.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Telefone de Emergência</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...register(`guardians.${index}.emergencyPhone`, {
                                    onChange: (e) => {
                                      const formatted = formatPhone(e.target.value);
                                      setValue(`guardians.${index}.emergencyPhone`, formatted);
                                    }
                                  })}
                                  placeholder="(11) 99999-9999"
                                  maxLength={15}
                                  className="pl-10"
                                />
                              </div>
                              <p className="text-gray-500 text-xs mt-1">
                                Telefone alternativo para emergências
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Additional Information */}
                        <div>
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Informações Adicionais
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                              <label className="block text-sm font-medium mb-2">RG</label>
                              <Input
                                {...register(`guardians.${index}.rg`)}
                                placeholder="00.000.000-0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="date"
                                  {...register(`guardians.${index}.birthDate`)}
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Profissão</label>
                              <Input 
                                {...register(`guardians.${index}.profession`)} 
                                placeholder="Ex: Professor, Enfermeiro"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Estado Civil</label>
                              <select
                                {...register(`guardians.${index}.maritalStatus`)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="single">Solteiro(a)</option>
                                <option value="married">Casado(a)</option>
                                <option value="divorced">Divorciado(a)</option>
                                <option value="widowed">Viúvo(a)</option>
                              </select>
                            </div>

                            {/* Financial Responsibility */}
                            <div className="md:col-span-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`guardians.${index}.isFinancialResponsible`}
                                  {...register(`guardians.${index}.isFinancialResponsible`)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label 
                                  htmlFor={`guardians.${index}.isFinancialResponsible`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  É o responsável financeiro do aluno
                                </label>
                              </div>
                            </div>

                            {/* Password field - only show if this guardian is financial responsible */}
                            {watchedGuardians[index]?.isFinancialResponsible && (
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                  Senha para acesso ao dashboard *
                                </label>
                                <Input
                                  type="password"
                                  {...register(`guardians.${index}.password`)}
                                  placeholder="Crie uma senha para acesso ao sistema"
                                  className={errors.guardians?.[index]?.password ? "border-red-500" : ""}
                                />
                                {errors.guardians?.[index]?.password && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.guardians[index]?.password?.message}
                                  </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                  Esta senha será usada para acessar o dashboard dos pais
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Address Information */}
                        <div>
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Endereço
                          </h5>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">CEP</label>
                                <div className="relative">
                                  <Input
                                    {...register(`guardians.${index}.zipCode`, {
                                      onChange: (e) => {
                                        const formatted = formatCEP(e.target.value);
                                        setValue(`guardians.${index}.zipCode`, formatted);
                                        if (formatted.length === 9) {
                                          fetchAddressFromCEP(formatted, index);
                                        }
                                      }
                                    })}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className={errors.guardians?.[index]?.zipCode ? "border-red-500" : ""}
                                  />
                                  {addressLoading[index] && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                  )}
                                </div>
                                {errors.guardians?.[index]?.zipCode && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.guardians[index]?.zipCode?.message}
                                  </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                  Preencha para buscar o endereço automaticamente
                                </p>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Endereço Completo *</label>
                                <Input
                                  {...register(`guardians.${index}.address`)}
                                  placeholder="Rua, Avenida, número"
                                  className={errors.guardians?.[index]?.address ? "border-red-500" : ""}
                                />
                                {errors.guardians?.[index]?.address && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.guardians[index]?.address?.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Bairro</label>
                                <Input 
                                  {...register(`guardians.${index}.neighborhood`)} 
                                  placeholder="Nome do bairro"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Complemento</label>
                                <Input
                                  {...register(`guardians.${index}.complement`)}
                                  placeholder="Apartamento, casa, bloco, etc."
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>

            <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {Object.keys(errors).length} erro(s) encontrado(s)
                      </span>
                    </div>
                  )}
                  {isValid && Object.keys(dirtyFields).length > 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Formulário válido
                      </span>
                    </div>
                  )}
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 max-w-md">
                    <div>Valid: {isValid ? '✓' : '✗'} | Guardians: {guardianFields.length} | Total Errors: {Object.keys(errors).length}</div>
                    {Object.keys(errors).length > 0 && (
                      <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                        <div className="font-medium">Erros de Validação:</div>
                        {errors.name && <div>• Nome: {errors.name.message}</div>}
                        {errors.birthDate && <div>• Data Nascimento: {errors.birthDate.message}</div>}
                        {errors.cpf && <div>• CPF: {errors.cpf.message}</div>}
                        {errors.gender && <div>• Gênero: {errors.gender.message}</div>}
                        {errors.birthPlace && <div>• Local Nascimento: {errors.birthPlace.message}</div>}
                        {errors.guardians && (
                          <div>
                            • Responsáveis: {Array.isArray(errors.guardians) ? errors.guardians.length : 'erro geral'}
                            {Array.isArray(errors.guardians) && errors.guardians.map((guardianError, index) => (
                              guardianError && (
                                <div key={index} className="ml-2">
                                  Guardian {index + 1}:
                                  {guardianError.name && <div className="ml-2">- Nome: {guardianError.name.message}</div>}
                                  {guardianError.email && <div className="ml-2">- Email: {guardianError.email.message}</div>}
                                  {guardianError.phone && <div className="ml-2">- Telefone: {guardianError.phone.message}</div>}
                                  {guardianError.cpf && <div className="ml-2">- CPF: {guardianError.cpf.message}</div>}
                                  {guardianError.address && <div className="ml-2">- Endereço: {guardianError.address.message}</div>}
                                  {guardianError.relationship && <div className="ml-2">- Relacionamento: {guardianError.relationship.message}</div>}
                                  {guardianError.zipCode && <div className="ml-2">- CEP: {guardianError.zipCode.message}</div>}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    Cancelar
                  </Button>
                  
                  {currentTab === "student" && guardianFields.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("guardians")}
                      className="min-w-[120px]"
                    >
                      Próximo: Responsáveis
                    </Button>
                  )}
                  
                  {currentTab === "guardians" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("student")}
                      className="min-w-[100px]"
                    >
                      Voltar: Aluno
                    </Button>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || guardianFields.length === 0 || (!isValid && Object.keys(errors).length > 0)}
                    className="min-w-[100px] bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {student ? "Atualizar" : "Cadastrar"}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

