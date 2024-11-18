import {
  Document,
  Paragraph,
  Packer,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  ImageRun,
  TextWrappingType,
  TextWrappingSide,
} from "docx";
import axios from "axios";

const downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

export const generateDocx = async (extractedData) => {
  try {
    const imageUrl =
      "https://resume-rewrite.s3.ap-south-1.amazonaws.com/header.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA3CMCCH62WWLFNXHK%2F20241118%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241118T105326Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiSDBGAiEAkBhZre%2Bcssm23CnGYmduBlklYby7NcoUWeSI9mkNv%2BICIQDF0%2BiZrcwU%2FytfODd7G0CX1UeMQH4N7ksW4F9Iltfm5iqZAghcEAAaDDc2MTAxODg1OTQ0NSIMjJRyMwPZqr4oCk71KvYBaeblCvZ70GYt5IjBrZnSCWGOFSfnFSFG3lNaXMzxp7pGVNv7K2PvQFq7ps0y2GsD42XG5kAm63P9cSBbd%2BPLvWkswqIn2Z6y5yHqdBfk6LhnqFRiI54qpzks13NTscrGSA5tkSW7acx9Nd01J9jpzddGTbbTpFGqQ98Ee2yAhRJEiBVR1M8HHKACbK6UFKiVY2HMYqr1On4GEi75cbEd3VDOWDoPfhLR5jhzSfCOYDMxUoBY5fOPb2Qi%2FkTtHPRUiajHbDJSV0Q7KZII2kLTuMMSYQmz1tQXTnb8%2FzEzY9waL9UjagtF2Uny6Hl9mmNMscHCajTkMKSc7LkGOt4BJty5mNfGMkcKu%2FKLFX7MbsVweaAoyC%2B0V0DjO1P4wv15zNC9QRRZxhcxQ%2F6v4JgLuwG5dyWaDu2fF62Xkc0F5Ux7mltlS%2FrxXQMQo1XEy%2FsfQuLVIiPbwAFcH%2F7%2F0DL16cGBeQhDpYuYZtaF2ouRQkhfk1TbotMcrM7D8txBzsJjjeKizQb0xopmNX4gj6WyUBJSWEroLGy%2F%2FEpl8mp2dj81hEiYQFeKuoc13v7mcrwnDQMSM23FJDrwTpoOVSKhlGtjSgW7Q%2B5e2le9P6e8UmqC4t7v02cfskuctCc0&X-Amz-Signature=c37a4788fce8eb6447694bb77e51b59a290e83de442a240c2fd80d0e331fe4a4&X-Amz-SignedHeaders=host&response-content-disposition=inline";
    const imageBuffer = await downloadImage(imageUrl);

    const doc = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                // Centered name
                extractedData?.name
                  ? new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: extractedData?.name?.toUpperCase(),
                          bold: true,
                          size: 22,
                          font: "Carlito",
                          color: "808080",
                        }),
                      ],
                    })
                  : null,
                // Image on the right
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageBuffer,
                      transformation: {
                        width: 100,
                        height: 100,
                      },
                      floating: {
                        horizontalPosition: {
                          relative: "page",
                          align: "right",
                        },
                        verticalPosition: {
                          relative: "page",
                          offset: 0,
                        },
                        wrap: {
                          type: TextWrappingType.SQUARE,
                          side: TextWrappingSide.RIGHT,
                        },
                      },
                    }),
                  ],
                }),
              ].filter(Boolean),
            }),
          },
          properties: {},
          children: [
            // PROFESSIONAL SUMMARY with border
            extractedData?.professionalSummary?.length
              ? new Paragraph({
                  spacing: {
                    before: 100,
                    after: 100,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },

                  children: [
                    new TextRun({
                      text: "PROFESSIONAL SUMMARY",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.professionalSummary?.map(
              (summary) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },
                  spacing: {
                    before: 100,
                    after: 100,
                  },
                  children: [
                    new TextRun({
                      text: summary,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            new Paragraph({
              spacing: {
                before: 300,
              },
            }),
            // TECHNICAL SKILLS with border
            Object.keys(extractedData?.technicalSkills || {}).length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "TECHNICAL SKILLS",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            new Table({
              rows: [
                ...Object.keys(extractedData?.technicalSkills || {}).map(
                  (skillCategory) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          shading: {
                            type: ShadingType.CLEAR,
                            color: "ffffff",
                            fill: "d3ddde",
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: skillCategory,
                                  size: 22,
                                  font: "Calibri",
                                }),
                              ],
                            }),
                          ],
                          verticalAlign: "center",
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text:
                                    extractedData?.technicalSkills?.[
                                      skillCategory
                                    ]?.join(", ") || "",
                                  size: 22,
                                  font: "Calibri",
                                }),
                              ],
                            }),
                          ],
                          verticalAlign: "center",
                        }),
                      ],
                    })
                ),
              ],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
            new Paragraph({
              spacing: {
                before: 300,
              },
            }),
            // WORK EXPERIENCE with border
            extractedData?.workExperience?.length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "WORK EXPERIENCE",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.workExperience?.flatMap((exp) => [
              exp?.Organization
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Organization: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: exp?.Organization,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              exp?.role
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Role: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: exp?.role,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              exp?.duration
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Duration: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: exp?.duration + " " + "Months",
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                    spacing: {
                      after: 200,
                    },
                  })
                : null,
              exp?.responsibilities?.length
                ? new Paragraph({
                    spacing: {
                      after: 150,
                    },
                    children: [
                      new TextRun({
                        text: "Responsibilities: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              ...(exp?.responsibilities?.map(
                (responsibility) =>
                  new Paragraph({
                    bullet: {
                      level: 0,
                    },
                    children: [
                      new TextRun({
                        text: responsibility,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
              ) || []),
              new Paragraph({
                spacing: {
                  before: 200,
                },
              }),
            ]) || []),
            // PROJECTS with border
            extractedData?.projects?.length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "PROJECTS",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.projects?.flatMap((proj, index) => [
              proj?.project
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: `Project#${index + 1}: `,
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.project,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              proj?.role
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Role: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.role,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              proj?.client
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Client: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.client,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              proj?.toolsUsed?.length > 0
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Tools Used: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.toolsUsed?.join(", "),
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              proj?.duration
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Duration: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.duration + " " + "Months",
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              // Spacing after Description
              proj?.description
                ? new Paragraph({
                    children: [
                      new TextRun({
                        text: "Description: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: proj?.description,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                    spacing: {
                      after: 150,
                    },
                  })
                : null,
              proj?.responsibilities?.length
                ? new Paragraph({
                    spacing: {
                      after: 150,
                    },
                    children: [
                      new TextRun({
                        text: "Responsibilities: ",
                        bold: true,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
                : null,
              ...(proj?.responsibilities?.map(
                (responsibility) =>
                  new Paragraph({
                    bullet: {
                      level: 0,
                    },
                    children: [
                      new TextRun({
                        text: responsibility,
                        size: 22,
                        font: "Calibri",
                      }),
                    ],
                  })
              ) || []),
              new Paragraph({
                spacing: {
                  before: 200,
                },
              }),
            ]) || []),
            // EDUCATION with border
            extractedData?.education?.length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                    before: 200,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "EDUCATION",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.education?.map(
              (edu) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu?.degree || ""} - ${
                        edu?.institution || ""
                      } (${edu?.year || ""})`,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            // Space between Education and Certifications
            extractedData?.certifications?.length
              ? new Paragraph({
                  spacing: {
                    before: 200,
                  },
                })
              : null,
            // CERTIFICATIONS with border
            extractedData?.certifications?.length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "CERTIFICATIONS",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.certifications?.map(
              (cert) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${cert?.name || ""} - ${cert?.issuer || ""} ${
                        cert?.date || ""
                      }`,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            // EDUCATION with border
            extractedData?.achievements?.length
              ? new Paragraph({
                  spacing: {
                    after: 200,
                    before: 300,
                  },
                  border: {
                    bottom: {
                      color: "000000",
                      space: 1,
                      value: "single",
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: "Achievements",
                      bold: true,
                      size: 22,
                      font: "Arial",
                    }),
                  ],
                })
              : null,
            ...(extractedData?.achievements?.map(
              (ache) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },
                  children: [
                    new TextRun({
                      text: ache,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            new Paragraph({
              spacing: {
                before: 200,
              },
            }),
          ].filter(Boolean),
        },
      ],
    });

    // Convert the document to buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.log(error, "error");
  }
};
