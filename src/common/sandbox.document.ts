/**
 * Запрос, который Sandbox подставляет в редактор при открытии.
 *
 * Это дословный опорный запрос из технического задания. Открывший ссылку
 * видит его готовым к запуску, а не заглушку Apollo `query ExampleQuery { id }`,
 * которая к нашей схеме отношения не имеет и сразу возвращает ошибку валидации.
 */
export const SANDBOX_DOCUMENT = `query {
  profile {
    name
    description
    skills {
      name
    }
    experience {
      company
      position
    }
    projects {
      name
    }
  }
}

# Полный набор полей: ссылки, фильтр навыков по категории,
# вложенные достижения и вычисляемые поля периода.
#
# query {
#   profile {
#     name
#     description
#     links { label url }
#     skills(category: BACKEND) { name category }
#     experience {
#       company
#       position
#       period
#       isCurrent
#       durationMonths
#       achievements { text }
#     }
#     projects { name repoUrl liveUrl description }
#   }
# }
`;
