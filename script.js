document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("agendamentoForm");

  function verificarIdade(dataNascimento, idadeInformada) {
    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    let idadeCalculada = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idadeCalculada--;
    }

    return idadeCalculada === parseInt(idadeInformada);
  }

  function gerarPDF(dados) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(12);
    Object.entries(dados).forEach(([chave, valor]) => {
      if (valor && valor.trim() !== "") {
        doc.text(`${chave}: ${valor}`, 10, y);
        y += 8;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      }
    });

    doc.save("agendamento.pdf");
  }

  function enviarParaWhatsApp(dados) {
    let mensagem = "Novo agendamento Teravita:%0A";
    Object.entries(dados).forEach(([chave, valor]) => {
      if (valor && valor.trim() !== "") {
        mensagem += `${chave}: ${valor}%0A`;
      }
    });
    const url = `https://api.whatsapp.com/send?phone=5511977279045&text=${mensagem}`;
    window.open(url, "_blank");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dadosFormulario = {
      Nome: form.nome.value.trim(),
      Telefone: form.telefone.value.trim(),
      Idade: form.idade.value,
      "Cuidados Médicos": form.cuidados_medicos.value,
      "Médico/Especialidade": form.especialidade.value,
      "Medicamentos Contínuos": form.medicamentos.value,
      "Quais Medicamentos": form.quais_medicamentos.value,
      "Já fez cirurgia": form.cirurgia.value,
      "Quais Cirurgias": form.quais_cirurgias.value,
      "Condições de Saúde": Array.from(form.querySelectorAll("input[name='condicoes']:checked")).map(el => el.value).join(", "),
      "Sente Dores": form.dores.value,
      "Onde Sente Dor": form.onde_dor.value,
      "Intensidade da Dor": form.intensidade.value,
      "Alergia": form.alergia.value,
      "Quais Alergias": form.quais_alergias.value,
      "Tratamentos Já Realizados": Array.from(form.querySelectorAll("input[name='tratamentos']:checked")).map(el => el.value).join(", "),
      "Preferência ou Restrição": form.preferencias.value,
      "Contraindicação Médica": form.contraindicacao.value,
      "Quais Contraindicações": form.quais_contra.value,
      "Gravidez/Pós-parto": form.gravidez.value,
      Serviço: form.servico.value,
      Data: form.data.value,
      Hora: form.hora.value
    };

    let erros = [];
    if (!dadosFormulario.Nome) erros.push("Preencha o nome completo.");
    if (!dadosFormulario.Telefone) erros.push("Informe um telefone válido.");
    if (dadosFormulario.Email && !/^\S+@\S+\.\S+$/.test(dadosFormulario.Email)) erros.push("Informe um e-mail válido.");
    if (dadosFormulario["Data de Nascimento"] && dadosFormulario.Idade && !verificarIdade(dadosFormulario["Data de Nascimento"], dadosFormulario.Idade)) erros.push("A idade não corresponde à data de nascimento.");
    if (dadosFormulario["Intensidade da Dor"] && (dadosFormulario["Intensidade da Dor"] < 0 || dadosFormulario["Intensidade da Dor"] > 10)) erros.push("A intensidade da dor deve estar entre 0 e 10.");
    if (!dadosFormulario.Serviço) erros.push("Selecione um serviço desejado.");
    if (!dadosFormulario.Data) erros.push("Escolha uma data preferida.");
    if (!dadosFormulario.Hora) erros.push("Escolha um horário preferido.");

    if (erros.length > 0) {
      alert("Corrija os seguintes erros:\n\n" + erros.join("\n"));
      return;
    }

    try {
      gerarPDF(dadosFormulario);
      alert("Seu agendamento foi iniciado. O WhatsApp será aberto para finalizar.");
      enviarParaWhatsApp(dadosFormulario);
      form.reset();
    } catch (error) {
      console.error("Erro ao gerar ou enviar PDF:", error);
      alert("Erro ao finalizar o agendamento. Tente novamente.");
    }
  });
});
